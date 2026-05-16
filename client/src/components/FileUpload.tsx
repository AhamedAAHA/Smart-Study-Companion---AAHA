"use client";

import { useState, useRef } from "react";
import { Upload, FileText, Loader2, X, CheckCircle2 } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { LectureDocument } from "@/types";

export function FileUpload({ onUploaded }: { onUploaded: (doc: LectureDocument) => void }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [title, setTitle] = useState("");
  const [module, setModule] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const clearFile = () => {
    setSelectedFile(null);
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setSuccess("");
    setSelectedFile(file);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError("Please select a PDF or PowerPoint file");
      return;
    }

    setUploading(true);
    setError("");
    setSuccess("");

    const form = new FormData();
    form.append("file", selectedFile);
    if (title.trim()) form.append("title", title.trim());
    if (module.trim()) form.append("module", module.trim());

    try {
      const res = await api<{ success: boolean; data: LectureDocument }>(
        "/documents/upload",
        { method: "POST", body: form }
      );
      setError("");
      setSuccess("Upload complete — opening your lecture…");
      onUploaded(res.data);
      setTitle("");
      setModule("");
      clearFile();
    } catch (err) {
      setSuccess("");
      setError(err instanceof ApiError ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleUpload} className="card space-y-4">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100 text-brand-700 dark:bg-brand-900/50 dark:text-brand-300">
          <Upload className="h-5 w-5" />
        </span>
        <div>
          <h2 className="font-semibold text-fg">Upload Lecture Material</h2>
          <p className="text-sm text-fg-muted">PDF or PowerPoint — max 25MB</p>
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

      <label
        className={`dropzone relative ${selectedFile ? "border-brand-400 bg-brand-50/60 dark:border-brand-500/50 dark:bg-brand-950/30" : ""}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.ppt,.pptx,application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
          className="hidden"
          onChange={handleFileChange}
        />
        {selectedFile ? (
          <div className="flex w-full items-center gap-3 text-left">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-100 dark:bg-brand-900/50">
              <CheckCircle2 className="icon-brand h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-fg">
                {selectedFile.name}
              </p>
              <p className="text-xs text-fg-muted">
                {formatSize(selectedFile.size)} · Ready to upload
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                clearFile();
              }}
              className="shrink-0 rounded-lg p-1.5 text-fg-muted transition hover:bg-slate-200/80 hover:text-fg dark:hover:bg-slate-700"
              aria-label="Remove selected file"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <>
            <FileText className="icon-brand mb-2 h-8 w-8" />
            <span className="text-sm font-medium text-fg-secondary">
              Click to choose file
            </span>
            <span className="mt-1 text-xs text-fg-muted">PDF or PowerPoint</span>
          </>
        )}
      </label>

      {success && !error && (
        <p className="text-sm font-medium text-brand-700 dark:text-brand-300">{success}</p>
      )}
      {error && <p className="text-sm text-danger">{error}</p>}

      <button
        type="submit"
        disabled={uploading || !selectedFile}
        className="btn-primary w-full sm:w-auto"
      >
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
