"use client";

import Link from "next/link";
import {
  Upload,
  FileText,
  Languages,
  Volume2,
  GraduationCap,
  Sparkles,
  ArrowRight,
  Play,
} from "lucide-react";
import { FadeIn } from "@/components/motion/FadeIn";
import { Hero3DPreview } from "@/components/home/Hero3DPreview";

const features = [
  {
    icon: Upload,
    title: "Upload lecture slides",
    desc: "PDF or PowerPoint — the AI reads and understands your notes.",
  },
  {
    icon: FileText,
    title: "Cheat sheets & flashcards",
    desc: "Exam-focused summaries and Q&A cards for fast revision.",
  },
  {
    icon: Languages,
    title: "Tamil & Sinhala",
    desc: "Tamil–English and Sinhala–English mix — how students actually explain concepts.",
  },
  {
    icon: Volume2,
    title: "Walk & Learn podcast",
    desc: "Earphones on, AI teaches topic-by-topic. Say “wait, explain again” anytime.",
  },
  {
    icon: GraduationCap,
    title: "Mock viva practice",
    desc: "One-by-one questions with feedback like a real examiner.",
  },
  {
    icon: Sparkles,
    title: "Built for Sri Lanka",
    desc: "University courses, bilingual study, and oral exam prep.",
  },
];

const tags = ["Walk & Learn", "Tamil & Sinhala", "Mock viva", "ElevenLabs TTS"];

export function LandingPage() {
  return (
    <div className="landing">
      <section className="landing-hero hero-gradient" aria-labelledby="hero-heading">
        <div className="landing-hero-glow" aria-hidden />
        <div className="landing-container landing-hero-inner">
          <div className="landing-hero-grid">
            <div className="landing-hero-copy">
              <FadeIn delay={0.08}>
                <div className="hero-title-wrap">
                  <h1
                    id="hero-heading"
                    className="font-display text-[1.75rem] font-bold leading-tight sm:text-4xl lg:text-[2.5rem] lg:leading-[1.15]"
                  >
                    <span className="text-gradient block">Upload your lecture slides</span>
                    <span className="hero-subline mt-4 block text-lg font-medium text-fg-on-surface-strong sm:text-xl">
                      and learn with AI in{" "}
                      <span className="hero-chip">English</span>{" "}
                      <span className="hero-chip hero-chip-tamil">Tamil</span>{" "}
                      <span className="hero-chip">Sinhala</span> or{" "}
                      <span className="hero-chip hero-chip-voice">voice mode</span>
                    </span>
                  </h1>
                </div>
              </FadeIn>

              <FadeIn delay={0.16}>
                <p className="landing-lead max-w-lg text-pretty text-base leading-relaxed text-fg-on-surface sm:text-lg">
                  Smart Study Companion helps Sri Lankan students turn PDFs into cheat
                  sheets, flashcards, Tamil explanations, and mock viva sessions.
                </p>
              </FadeIn>

              <FadeIn delay={0.24}>
                <div className="landing-cta-row">
                  <Link href="/signup" className="btn-primary group !px-6 !py-3">
                    Start free
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <Link href="/demo" className="btn-secondary gap-2 !px-6 !py-3">
                    <Play className="h-4 w-4" />
                    Watch demo
                  </Link>
                </div>
                <p className="landing-cta-note">Free for students · Tamil + English · ElevenLabs voice</p>
              </FadeIn>

              <FadeIn delay={0.32}>
                <ul className="landing-tags" aria-label="Key features">
                  {tags.map((tag) => (
                    <li key={tag}>
                      <span className="landing-tag">{tag}</span>
                    </li>
                  ))}
                </ul>
              </FadeIn>
            </div>

            <FadeIn delay={0.12} direction="left" className="landing-hero-visual">
              <Hero3DPreview />
            </FadeIn>
          </div>
        </div>
      </section>

      <section className="landing-features scroll-reveal" aria-labelledby="features-heading">
        <div className="landing-container">
          <header className="landing-section-header">
            <FadeIn>
              <p className="landing-section-label">Prompt → Study stack</p>
              <h2
                id="features-heading"
                className="font-display text-2xl font-bold text-fg sm:text-3xl"
              >
                Everything you need before exams
              </h2>
              <p className="landing-section-desc">
                Upload once. AI builds cheat sheets, flashcards, Tamil voice, and viva
                practice around your slides.
              </p>
            </FadeIn>
          </header>

          <ul className="landing-feature-grid">
            {features.map((f, i) => (
              <li key={f.title} className="h-full">
                <FadeIn delay={i * 0.06} className="h-full">
                  <article className="landing-feature-card card-interactive group h-full">
                    <div className="widget-card-header">
                      <span className="widget-card-icon" aria-hidden>
                        <f.icon className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                      </span>
                      <span className="status-dot status-dot-live" title="Available" />
                    </div>
                    <div className="widget-card-body">
                      <h3 className="text-base font-semibold text-fg">{f.title}</h3>
                      <p className="text-sm leading-relaxed text-fg-muted">{f.desc}</p>
                    </div>
                    <footer className="widget-card-footer">
                      <ul className="widget-tags">
                        <li>
                          <span className="pill-tag">Study</span>
                        </li>
                        <li>
                          <span className="pill-tag">AI</span>
                        </li>
                      </ul>
                    </footer>
                  </article>
                </FadeIn>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="landing-cta scroll-reveal">
        <div className="landing-container">
          <FadeIn>
            <div className="landing-cta-panel section-glass">
              <span
                className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-brand-500/10 via-transparent to-accent-500/5"
                aria-hidden
              />
              <h2 className="font-display relative text-2xl font-bold text-fg sm:text-3xl">
                OS viva tomorrow? Revise smarter tonight.
              </h2>
              <p className="relative mx-auto mt-4 max-w-xl text-base leading-relaxed text-fg-muted">
                PDF → cheat sheet → flashcards → Tamil lecturer voice → mock viva. One
                adaptive study OS.
              </p>
              <Link href="/signup" className="btn-primary relative mt-8 inline-flex !px-8 !py-3">
                Build your study stack
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
