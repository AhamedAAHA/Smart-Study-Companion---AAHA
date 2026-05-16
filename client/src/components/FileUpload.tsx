"use client";

import { useState, useRef } from "react";
import { Upload, FileText, Loader2 } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { LectureDocument } from "@/types";

export function FileUpload({ onUploaded }: { onUploaded: (doc: LectureDocument) => void }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [module, setModule] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    const file = inputRef.current?.files?.[0];
    if (!file) {
      setError("Please select a PDF or PowerPoint file");
      return;
    }

    setUploading(true);
    setError("");

    const form = new FormData();
    form.append("file", file);
    if (title.trim()) form.append("title", title.trim());
    if (module.trim()) form.append("module", module.trim());

    try {
      const res = await api<{ success: boolean; data: LectureDocument }>(
        "/documents/upload",
        { method: "POST", body: form }
      );
      onUploaded(res.data);
      setTitle("");
      setModule("");
      if (inputRef.current) inputRef.current.value = "";
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleUpload} className="card space-y-4">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
          <Upload className="h-5 w-5" />
        </span>
        <div>
          <h2 className="font-semibold text-slate-900">Upload Lecture Material</h2>
          <p className="text-sm text-slate-500">PDF or PowerPoint — max 25MB</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Title (optional)</label>
          <input
            className="input"
            placeholder="e.g. Operating Systems Lecture 5"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Module / Subject</label>
          <input
            className="input"
            placeholder="e.g. Operating Systems"
            value={module}
            onChange={(e) => setModule(e.target.value)}
          />
        </div>
      </div>

      <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 px-6 py-10 transition hover:border-brand-400 hover:bg-brand-50/30">
        <FileText className="mb-2 h-8 w-8 text-brand-600" />
        <span className="text-sm font-medium text-slate-700">
          Click to choose file
        </span>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.ppt,.pptx,application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
          className="hidden"
        />
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button type="submit" disabled={uploading} className="btn-primary w-full sm:w-auto">
        {uploading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Upload className="h-4 w-4" />
            Upload & Process
          </>
        )}
      </button>
    </form>
  );
}
