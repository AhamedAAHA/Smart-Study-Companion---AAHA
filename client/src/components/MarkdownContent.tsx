"use client";

import ReactMarkdown from "react-markdown";

export function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="prose-study max-w-none">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
