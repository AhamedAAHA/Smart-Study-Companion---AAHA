/** Same-origin `/api` is proxied to Express via next.config.mjs rewrites */
export function getApiBaseUrl(): string {
  let url = (process.env.NEXT_PUBLIC_API_URL || "/api").replace(/\/$/, "");
  if (url.startsWith("http") && !url.endsWith("/api")) {
    url = `${url}/api`;
  }
  return url;
}

const API_URL = getApiBaseUrl();

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("ssc_token");
}

function parseResponseBody(text: string): { message?: string } {
  if (!text) return {};
  try {
    return JSON.parse(text) as { message?: string };
  } catch {
    const plain = text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    return { message: plain || undefined };
  }
}

export async function api<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const method = options.method ?? (options.body ? "POST" : "GET");
  const headers: HeadersInit = {
    ...(options.body instanceof FormData
      ? {}
      : { "Content-Type": "application/json" }),
    ...(options.headers || {}),
  };

  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, method, headers });
  const text = await res.text();
  const data = parseResponseBody(text);

  if (!res.ok) {
    const fallback =
      res.status === 404 && API_URL.startsWith("/")
        ? "API not found. Is the backend running on port 5000?"
        : "Request failed";
    throw new ApiError(data.message || fallback, res.status);
  }

  try {
    return (text ? JSON.parse(text) : {}) as T;
  } catch {
    return {} as T;
  }
}

export function audioUrl(path?: string): string {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  if (API_URL.startsWith("/") && typeof window !== "undefined") {
    return `${window.location.origin}${path.startsWith("/") ? path : `/${path}`}`;
  }
  const base = API_URL.replace(/\/api$/, "");
  return `${base}${path}`;
}
