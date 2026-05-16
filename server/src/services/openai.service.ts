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

async function chat(system: string, user: string): Promise<string> {
  const client = ensureOpenAI();
  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    temperature: 0.7,
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
  return chat(
    `You are an expert tutor for Sri Lankan university students. Create concise, exam-focused cheat sheets with clear headings, definitions, key points, and short examples. Use markdown formatting.`,
    `Create a cheat sheet from this lecture material titled "${title}":\n\n${truncateSource(documentText)}`
  );
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
  return `# ${title} — Cheat Sheet\n\n## Key Concepts\n- Review definitions from your uploaded slides\n- Focus on exam-style short answers\n\n## Tips\n- Practice explaining each topic aloud\n- Link theory to real examples from lectures\n\n*Connect OPENAI_API_KEY for AI-generated content.*`;
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
