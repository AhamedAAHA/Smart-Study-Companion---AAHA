import Link from "next/link";
import {
  Upload,
  FileText,
  Languages,
  Volume2,
  GraduationCap,
  Sparkles,
} from "lucide-react";

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
    title: "Tamil explanations",
    desc: "Simple Tamil and lecturer-style teaching, not dry translation.",
  },
  {
    icon: Volume2,
    title: "Voice with ElevenLabs",
    desc: "Listen to explanations while travelling or before your viva.",
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

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-b from-brand-50 via-white to-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-200/30 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <p className="mb-3 inline-flex rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-800">
            Best Build by ElevenLabs
          </p>
          <h1 className="font-display max-w-3xl text-4xl font-bold leading-tight text-brand-950 sm:text-5xl">
            Upload your lecture slides and learn with AI in English, Tamil, or voice mode
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-slate-600">
            Smart Study Companion helps Sri Lankan students turn PDFs into cheat sheets,
            flashcards, Tamil explanations, mock viva sessions, and realistic voice lessons.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/signup" className="btn-primary">
              Get started free
            </Link>
            <Link href="/login" className="btn-secondary">
              Login
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="font-display text-center text-2xl font-bold text-slate-900">
          Everything you need before exams
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="card transition hover:shadow-glow">
              <f.icon className="h-8 w-8 text-brand-600" />
              <h3 className="mt-3 font-semibold text-slate-900">{f.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-slate-200 bg-brand-900 px-4 py-14 text-center text-white sm:px-6">
        <h2 className="font-display text-2xl font-bold">
          Demo scenario: Operating Systems viva tomorrow?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-brand-100">
          Upload your deadlock PDF → cheat sheet → flashcards → Tamil lecturer explanation →
          ElevenLabs voice → mock viva. Revise smarter tonight.
        </p>
        <Link href="/signup" className="btn-accent mt-6 inline-flex">
          Start studying now
        </Link>
      </section>
    </>
  );
}
