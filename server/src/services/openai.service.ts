import OpenAI from "openai";
import { env } from "../config/env";
import { AppError } from "../middleware/errorHandler";
import { IFlashcard } from "../models/StudyMaterial";

const openai = env.openaiApiKey
  ? new OpenAI({ apiKey: env.openaiApiKey })
  : null;

function ensureOpenAI(): OpenAI {
  if (!openai) {
    throw new AppError(
      "OpenAI API key is not configured. Add OPENAI_API_KEY to your .env file.",
      503
    );
  }
  return openai;
}

export function isOpenAIConfigured(): boolean {
  return Boolean(openai);
}

export async function chat(
  system: string,
  user: string,
  opts?: { maxTokens?: number; temperature?: number }
): Promise<string> {
  const client = ensureOpenAI();
  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    temperature: opts?.temperature ?? 0.7,
    max_tokens: opts?.maxTokens,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new AppError("AI returned empty response", 502);
  return content;
}

function truncateSource(text: string, max = 12000): string {
  return text.length > max ? text.slice(0, max) + "\n\n[Content truncated...]" : text;
}

export async function generateCheatSheet(
  documentText: string,
  title: string
): Promise<string> {
  if (!openai) {
    return demoCheatSheet(title);
  }

  try {
    return await chat(
      `You are an expert tutor for Sri Lankan university students. Create concise, exam-focused cheat sheets with clear headings, definitions, key points, and short examples. Use markdown formatting. Always produce substantial content (at least 8 sections or bullet groups).`,
      `Create a cheat sheet from this lecture material titled "${title}":\n\n${truncateSource(documentText)}`
    );
  } catch {
    return demoCheatSheet(title);
  }
}

export type SriLankanMixMode =
  | "tamil_english"
  | "sinhala_english"
  | "student_lk";

export type ExplanationStyle =
  | "english"
  | "tamil"
  | "both"
  | SriLankanMixMode;

export type VoiceRefineMode =
  | "simpler"
  | "real_life"
  | "tamil"
  | "tamil_english"
  | "sinhala_english"
  | "student_lk"
  | "slow"
  | "repeat";

const SRI_LANKAN_MIX_GUIDES: Record<SriLankanMixMode, string> = {
  tamil_english: `Use natural Tamil–English mix like Sri Lankan university students in tutorials.
- Keep technical terms in English (semaphore, process, thread, mutex, etc.)
- Use spoken Tamil flow with words like "na", "oru", "thaan", "appuram", "actually", "basically"
- Example tone: "Semaphore na basically oru resource access control system."
- NOT formal literary Tamil or word-for-word translation from English`,
  sinhala_english: `Use natural Sinhala–English mix like Sri Lankan university students.
- Keep technical terms in English
- Write Sinhala parts in romanized Sinhala so students can read easily
- Friendly tutorial tone; example vibe: "Semaphore eka basically resource access control system ekak."
- NOT formal-only Sinhala or direct translation`,
  student_lk: `Use simple Sri Lankan student English — how local undergraduates explain to friends before exams.
- Clear, casual, exam-focused; avoid stiff international textbook tone
- Light local flavor is OK; stay mostly in English
- Example vibe: "Semaphore is basically — resource access control system, very simple."`,
};

export function explanationStyleGuide(style: ExplanationStyle): string {
  if (style === "tamil_english" || style === "sinhala_english" || style === "student_lk") {
    return SRI_LANKAN_MIX_GUIDES[style];
  }
  if (style === "tamil") {
    return "Answer mainly in simple Tamil with English technical terms (Tamil-English mix).";
  }
  if (style === "english") {
    return "Answer in clear English suitable for Sri Lankan university students.";
  }
  return "Answer in English with key points also explained simply in Tamil where helpful.";
}

const VOICE_REFINE_INSTRUCTIONS: Record<VoiceRefineMode, string> = {
  simpler:
    "Explain in simpler words for a student who is confused. Use short sentences, define jargon, and avoid heavy theory.",
  real_life:
    "Explain using a clear real-life analogy or everyday example that a Sri Lankan university student can remember.",
  tamil:
    "Explain mainly in simple Tamil with English technical terms (Tamil-English mix), like a friendly lecturer speaking aloud.",
  tamil_english: SRI_LANKAN_MIX_GUIDES.tamil_english,
  sinhala_english: SRI_LANKAN_MIX_GUIDES.sinhala_english,
  student_lk: SRI_LANKAN_MIX_GUIDES.student_lk,
  slow:
    "Explain very slowly and clearly for spoken audio: short steps, one idea per sentence, use commas for natural pauses.",
  repeat:
    "Repeat only the single most important point from the lecture. Make it memorable and exam-focused (about 60-90 seconds when read aloud).",
};

function normalizeVoiceRefineMode(mode: VoiceRefineMode): VoiceRefineMode {
  return mode === "tamil" ? "tamil_english" : mode;
}

export async function refineVoiceExplanation(
  documentText: string,
  title: string,
  previousExplanation: string,
  mode: VoiceRefineMode
): Promise<string> {
  const normalized = normalizeVoiceRefineMode(mode);
  const instruction = VOICE_REFINE_INSTRUCTIONS[normalized];

  if (!openai) {
    return demoVoiceRefinement(title, mode, previousExplanation);
  }

  try {
    return await chat(
      `You are a live voice tutor for Sri Lankan university students. The student is listening and tapped a button to change how you explain. Write markdown suitable for text-to-speech: no tables, no code blocks, conversational and warm. Keep it speakable in 1-3 minutes.`,
      `Lecture: "${title}"

Previous explanation:
${previousExplanation.slice(0, 5000)}

Student request: ${instruction}

Use the lecture notes when helpful:
${truncateSource(documentText, 8000)}`
    );
  } catch {
    return demoVoiceRefinement(title, mode, previousExplanation);
  }
}

export function demoVoiceRefinement(
  title: string,
  mode: VoiceRefineMode,
  previous: string
): string {
  const snippet = previous.slice(0, 200).replace(/[#*_`]/g, "");
  const labels: Record<VoiceRefineMode, string> = {
    simpler: "Simpler explanation",
    real_life: "Real-life example",
    tamil: "Tamil explanation",
    tamil_english: "Tamil–English mix",
    sinhala_english: "Sinhala–English mix",
    student_lk: "Sri Lankan student style",
    slow: "Slow, clear explanation",
    repeat: "Key point repeated",
  };
  return `## ${labels[mode]}: ${title}

${snippet}${snippet.length >= 200 ? "…" : ""}

This is a demo tutor response. Add **OPENAI_API_KEY** to your server \`.env\` for dynamic voice tutoring.

- Listen to the main ideas from your slides
- Try explaining them aloud in your own words
- Use the other tutor buttons to change style once AI is connected`;
}

export async function generateFlashcards(
  documentText: string,
  title: string
): Promise<IFlashcard[]> {
  const raw = await chat(
    `You create study flashcards for university students. Return ONLY valid JSON array: [{"question":"...","answer":"..."}]. Create 8-12 high-quality cards.`,
    `Create flashcards from "${title}":\n\n${truncateSource(documentText)}`
  );

  try {
    const match = raw.match(/\[[\s\S]*\]/);
    const parsed = JSON.parse(match ? match[0] : raw) as IFlashcard[];
    return parsed.map((c) => ({
      question: c.question,
      answer: c.answer,
      completed: false,
    }));
  } catch {
    throw new AppError("Failed to parse flashcards from AI response", 502);
  }
}

export type DoubtLanguage = ExplanationStyle;

export async function generateDoubtExplanation(
  documentText: string,
  title: string,
  doubt: string,
  language: DoubtLanguage = "both"
): Promise<string> {
  const langGuide = explanationStyleGuide(language);

  return chat(
    `You are a patient tutor for Sri Lankan university students answering one specific doubt about lecture notes.
${langGuide}
Use markdown: short heading, **Your doubt** (restate question), **Explanation** (concise steps + lecture examples), **Quick recap** (2-3 bullets). Stay focused; do not repeat the full lecture.`,
    `Lecture: "${title}"

Student's doubt:
${doubt.trim()}

Relevant lecture excerpts:
${truncateSource(documentText, 5000)}`,
    { maxTokens: 1000, temperature: 0.5 }
  );
}

export function demoDoubtExplanation(title: string, doubt: string): string {
  return `# Doubt answered: ${title}

## Your doubt
${doubt.trim()}

## Explanation
This is a demo response. Connect **OPENAI_API_KEY** in server \`.env\` for a full AI explanation based on your uploaded slides.

Review the relevant section in your lecture notes and try explaining the idea aloud in your own words.

## Quick recap
- Re-read the related slide or note section
- Write one definition and one example
- Ask your lecturer if anything is still unclear`;
}

export async function generateTamilExplanation(
  documentText: string,
  title: string,
  lecturerStyle = false
): Promise<string> {
  const style = lecturerStyle
    ? `Explain like a friendly Sri Lankan university lecturer in Tamil (simple Tamil-English mix). Use teaching tone, analogies, and step-by-step clarity—not word-for-word translation. Start with a warm intro like a real lecture.`
    : `Explain difficult concepts in simple Tamil (Tamil-English mix) for Sri Lankan students. Keep it clear and exam-focused.`;

  return chat(
    `You are a bilingual educator for Sri Lankan students. ${style}`,
    `Explain the key topics from "${title}":\n\n${truncateSource(documentText)}`
  );
}

export function localizedExplanationTitle(
  title: string,
  mode: SriLankanMixMode
): string {
  const labels: Record<SriLankanMixMode, string> = {
    tamil_english: "Tamil–English mix",
    sinhala_english: "Sinhala–English mix",
    student_lk: "Sri Lankan student style",
  };
  return `${labels[mode]}: ${title}`;
}

export async function generateSriLankanMixExplanation(
  documentText: string,
  title: string,
  mode: SriLankanMixMode
): Promise<string> {
  const guide = SRI_LANKAN_MIX_GUIDES[mode];

  if (!openai) {
    return demoSriLankanMixExplanation(title, mode);
  }

  try {
    return await chat(
      `You are a tutor for Sri Lankan university students. Students learn in mixed language naturally — mirror how they speak in tutorials, not textbook translation.

${guide}

Use markdown: clear headings, bullet points, short examples. Include at least one quoted example line in the target mixed style. Be exam-focused and encouraging.`,
      `Explain the key topics from the lecture "${title}" for revision:\n\n${truncateSource(documentText)}`
    );
  } catch {
    return demoSriLankanMixExplanation(title, mode);
  }
}

export function demoSriLankanMixExplanation(
  title: string,
  mode: SriLankanMixMode
): string {
  const samples: Record<SriLankanMixMode, string> = {
    tamil_english: `## ${title} — Tamil style

**Example line:** "Semaphore na basically oru resource access control system."

### Main idea
- Lecture slides la irukura core concepts ah step-by-step parunga
- Technical terms English la vechukonga — exam la adhu dhaan matter

### Quick recap
- Oru concept = oru definition + oru example
- Friend kitta explain pannunga — mix language natural ah varum

*Add OPENAI_API_KEY for full AI Tamil explanations from your PDF.*`,
    sinhala_english: `## ${title} — Sinhala style

**Example line:** "Semaphore eka basically resource access control system ekak."

### Main idea
- Lecture eke main points tika step-by-step balanna
- Technical terms English walin thiyaganna — exam eke important

### Quick recap
- Concept ekak = definition ekak + example ekak
- Friend kenek ta explain karanna — mix language natural

*Add OPENAI_API_KEY for full AI Sinhala explanations from your PDF.*`,
    student_lk: `## ${title} — Sri Lankan student style

**Example line:** "Semaphore is basically — resource access control system, very simple."

### Main idea
- Read your slides once, then explain each heading aloud in your own words
- Keep definitions short; add one local or lecture example

### Quick recap
- Don't memorize word-for-word — understand the flow
- Practice 2-minute answers before viva

*Add OPENAI_API_KEY for full AI explanations in student LK style.*`,
  };
  return samples[mode];
}

export async function generateVivaQuestions(
  documentText: string,
  title: string,
  count = 8
): Promise<string[]> {
  const raw = await chat(
    `You prepare mock viva questions for Sri Lankan university oral exams. Return ONLY a JSON array of question strings.`,
    `Generate ${count} viva questions for "${title}":\n\n${truncateSource(documentText)}`
  );

  try {
    const match = raw.match(/\[[\s\S]*\]/);
    const parsed = JSON.parse(match ? match[0] : raw) as string[];
    return parsed.filter((q) => typeof q === "string" && q.trim());
  } catch {
    throw new AppError("Failed to parse viva questions", 502);
  }
}

export async function evaluateVivaAnswer(
  question: string,
  answer: string,
  context: string
): Promise<{ feedback: string; score: number }> {
  const raw = await chat(
    `You are a viva examiner for Sri Lankan students. Evaluate answers fairly. Return ONLY JSON: {"feedback":"...","score":0-10}. Feedback should be encouraging and specific (e.g. "Good answer", "Add one example", "Revise this concept").`,
    `Context:\n${context.slice(0, 4000)}\n\nQuestion: ${question}\nStudent answer: ${answer}`
  );

  try {
    const match = raw.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(match ? match[0] : raw) as {
      feedback: string;
      score: number;
    };
    return {
      feedback: parsed.feedback || "Keep practicing this topic.",
      score: Math.min(10, Math.max(0, Number(parsed.score) || 5)),
    };
  } catch {
    return {
      feedback: "Good effort. Review the lecture notes and add more detail next time.",
      score: 5,
    };
  }
}

export async function summarizeForLecturer(
  documentText: string,
  title: string
): Promise<string> {
  return chat(
    `You summarize lecture content for lecturers to review before sharing with students. Be accurate and structured.`,
    `Summarize "${title}" for lecturer review:\n\n${truncateSource(documentText)}`
  );
}

/** Demo fallback when OpenAI is not configured */
export function demoCheatSheet(title: string): string {
  return `# ${title} — Cheat Sheet

## Overview
- Core themes from your uploaded lecture material
- Definitions, processes, and exam-style facts

## Key concepts
1. Identify the main topic of each slide or section
2. Write one-line definitions for every bold term
3. Note cause → effect chains and diagrams

## Exam tips
- Practice 2-minute spoken answers per topic
- Link theory to one real example from the lecture
- Revise weak areas with flashcards and mock viva

## Quick checklist
- [ ] Read all slide headings
- [ ] Memorize 10 key terms
- [ ] Explain the hardest topic aloud twice

*For a full AI cheat sheet from your PDF, add \`OPENAI_API_KEY\` to \`server/.env\` and restart the server.*`;
}

export interface McqQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export async function generateStudyPlan(
  documentText: string,
  title: string,
  examDate?: string
): Promise<string> {
  const examHint = examDate
    ? `The student's exam/viva is on ${examDate}. Plan backwards from that date.`
    : "Assume the exam is in 7 days.";

  return chat(
    `You create realistic revision plans for Sri Lankan university students. Use markdown with day-by-day tasks (Day 1, Day 2...), time blocks (morning/evening), and focus on viva + written exam prep. Include Tamil revision tip where helpful.`,
    `${examHint}\n\nCreate a 5-day study plan for "${title}":\n\n${truncateSource(documentText)}`
  );
}

export async function generateMcqQuiz(
  documentText: string,
  title: string
): Promise<McqQuestion[]> {
  const raw = await chat(
    `Create multiple-choice quiz questions for university students. Return ONLY valid JSON array: [{"question":"...","options":["A","B","C","D"],"correctIndex":0,"explanation":"..."}]. Create 6 questions. correctIndex is 0-3.`,
    `MCQ quiz for "${title}":\n\n${truncateSource(documentText)}`
  );

  try {
    const match = raw.match(/\[[\s\S]*\]/);
    const parsed = JSON.parse(match ? match[0] : raw) as McqQuestion[];
    return parsed.filter((q) => q.question && Array.isArray(q.options));
  } catch {
    throw new AppError("Failed to parse MCQ quiz", 502);
  }
}

export function demoStudyPlan(title: string): string {
  return `# 5-Day Study Plan: ${title}\n\n## Day 1\n- Read full notes (2h)\n- Write 10 key definitions\n\n## Day 2\n- Flashcards + cheat sheet\n- 30 min mock viva aloud\n\n## Day 3–5\n- Revise weak topics\n- Full mock viva with friend\n\n*Add OPENAI_API_KEY for a personalized AI plan.*`;
}

export function demoMcqQuiz(title: string): McqQuestion[] {
  return [
    {
      question: `What is the main focus of ${title}?`,
      options: [
        "Core lecture concepts",
        "Unrelated history",
        "Only lab equipment",
        "Exam timetable only",
      ],
      correctIndex: 0,
      explanation: "Revise the main themes from your uploaded lecture.",
    },
    {
      question: "Best viva preparation method?",
      options: [
        "Memorize without understanding",
        "Explain topics aloud with examples",
        "Skip practical questions",
        "Only read titles",
      ],
      correctIndex: 1,
      explanation: "Speaking answers aloud mirrors real viva conditions.",
    },
  ];
}

export function demoFlashcards(): IFlashcard[] {
  return [
    {
      question: "What is the main topic of this lecture?",
      answer: "Review your uploaded PDF for the core theme and definitions.",
      completed: false,
    },
    {
      question: "Name one exam-style question from this unit.",
      answer: "Prepare a 2-minute spoken answer with one example.",
      completed: false,
    },
  ];
}
