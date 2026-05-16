import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { BackLink } from "@/components/ui/BackLink";

export const metadata: Metadata = {
  title: "Product demo | Smart Study Companion",
  description:
    "Watch how Smart Study Companion turns lecture slides into cheat sheets, flashcards, and Tamil voice lessons.",
};

/** Bump when replacing `Rec 0004.mp4` / `client/public/demo/app-demo.mp4` */
const DEMO_VIDEO_VERSION = "20260516";
const DEMO_VIDEO_SRC = `/demo/app-demo.mp4?v=${DEMO_VIDEO_VERSION}`;

export default function DemoPage() {
  return (
    <div className="page-shell py-6 sm:py-10">
      <BackLink href="/" label="Back to home" className="mb-6" />

      <header className="mb-8 max-w-2xl">
        <p className="text-sm font-medium text-brand-600 dark:text-brand-400">
          Product demo
        </p>
        <h1 className="font-display mt-2 text-3xl font-bold text-fg sm:text-4xl">
          See Smart Study Companion in action
        </h1>
        <p className="mt-3 text-base leading-relaxed text-fg-muted">
          Upload lecture slides, generate study materials, and practice with Tamil
          voice and mock viva — built for Sri Lankan students.
        </p>
      </header>

      <div className="card overflow-hidden p-0 sm:p-0">
        <div className="border-b border-slate-200/80 bg-slate-50/80 px-4 py-3 dark:border-slate-700/80 dark:bg-slate-900/40 sm:px-5">
          <div className="flex items-center gap-2 text-sm text-fg-muted">
            <Sparkles className="h-4 w-4 text-brand-600 dark:text-brand-400" aria-hidden />
            <span>Screen recording · Smart Study Companion</span>
          </div>
        </div>

        <div className="bg-black">
          <video
            className="aspect-video w-full"
            controls
            playsInline
            preload="metadata"
            controlsList="nodownload"
          >
            <source src={DEMO_VIDEO_SRC} type="video/mp4" />
            Your browser does not support embedded video.{" "}
            <a href={DEMO_VIDEO_SRC} className="text-brand-400 underline">
              Download the demo video
            </a>
            .
          </video>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Link href="/signup" className="btn-primary group gap-2">
          Start free
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
        <Link href="/login" className="btn-secondary">
          Sign in
        </Link>
      </div>
    </div>
  );
}
