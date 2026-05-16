function parseFilename(disposition: string | null, fallback: string): string {
  if (!disposition) return fallback;

  const utf8 = disposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8?.[1]) {
    try {
      return decodeURIComponent(utf8[1].trim());
    } catch {
      /* use fallback */
    }
  }

  const basic = disposition.match(/filename="?([^";]+)"?/i);
  if (basic?.[1]) {
    return basic[1].trim().replace(/\+/g, " ");
  }

  return fallback;
}

function saveBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  window.setTimeout(() => {
    anchor.remove();
    URL.revokeObjectURL(url);
  }, 5000);
}

/** Binary download with auth — single completion handler avoids false NetworkError alerts. */
export function downloadAuthenticatedFile(
  url: string,
  token: string,
  fallbackFilename: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    let settled = false;

    const finish = (action: "resolve" | "reject", error?: Error) => {
      if (settled) return;
      settled = true;
      if (action === "resolve") resolve();
      else reject(error ?? new Error("Download failed"));
    };

    const xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.responseType = "blob";
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);

    xhr.onreadystatechange = () => {
      if (xhr.readyState !== XMLHttpRequest.DONE) return;

      if (xhr.status >= 200 && xhr.status < 300) {
        const blob = xhr.response as Blob;
        if (blob?.size > 0) {
          const filename = parseFilename(
            xhr.getResponseHeader("Content-Disposition"),
            fallbackFilename
          );
          saveBlob(blob, filename);
          finish("resolve");
          return;
        }
        finish("reject", new Error("Downloaded file is empty."));
        return;
      }

      if (xhr.status === 0) {
        finish(
          "reject",
          new Error(
            "Could not reach the server. Make sure the API is running on port 5000."
          )
        );
        return;
      }

      finish("reject", new Error(`Download failed (${xhr.status})`));
    };

    xhr.onerror = () => {
      if (xhr.readyState === XMLHttpRequest.DONE && xhr.status >= 200) {
        finish("resolve");
        return;
      }
      finish(
        "reject",
        new Error(
          "Could not reach the server. Make sure the API is running on port 5000."
        )
      );
    };

    xhr.onabort = () => {
      finish("reject", new Error("Download was cancelled."));
    };

    xhr.send();
  });
}
