import * as openai from "./openai.service";

export type WalkInterruptAction =
  | "repeat"
  | "explain_again"
  | "simpler"
  | "skip"
  | "continue";

export type WalkSegmentPlan = {
  title: string;
  script: string;
};

/** Map spoken / typed interrupt phrases to actions */
export function parseWalkInterruptCommand(text: string): WalkInterruptAction | null {
  const t = text.toLowerCase().trim();
  if (!t) return null;

  if (
    /explain again|say again|repeat|one more time|didn'?t get|wait.*explain|hold on.*explain|again please/.test(
      t
    )
  ) {
    return "explain_again";
  }
  if (/simpler|easier|slow down|too fast|confus/.test(t)) {
    return "simpler";
  }
  if (/skip|next topic|move on|continue to next/.test(t)) {
    return "skip";
  }
  if (/continue|keep going|go on|resume|carry on/.test(t)) {
    return "continue";
  }
  if (/wait|stop|pause|hold on/.test(t)) {
    return "repeat";
  }
  return null;
}

export async function generateWalkLessonPlan(
  documentText: string,
  lectureTitle: string,
  style: openai.ExplanationStyle = "tamil_english"
): Promise<WalkSegmentPlan[]> {
  const styleGuide = openai.explanationStyleGuide(style);

  if (!openai.isOpenAIConfigured()) {
    return demoWalkLessonPlan(lectureTitle);
  }

  try {
    const raw = await openai.chat(
      `You create podcast-style walking lessons for Sri Lankan university students listening on earphones while walking.

${styleGuide}

Return ONLY valid JSON:
[{"title":"Short topic name","script":"Spoken script 120-200 words, no markdown headers, no bullet symbols. Conversational podcast host tone. One concept per segment."}]

Create 6-8 segments that cover the lecture in order. Scripts must sound natural when read aloud.`,
      `Lecture title: "${lectureTitle}"

Material:
${documentText.slice(0, 10000)}`
    );

    const match = raw.match(/\[[\s\S]*\]/);
    const parsed = JSON.parse(match ? match[0] : raw) as WalkSegmentPlan[];
    return parsed
      .filter((s) => s.title && s.script)
      .slice(0, 10)
      .map((s) => ({
        title: String(s.title).trim(),
        script: String(s.script).trim(),
      }));
  } catch {
    return demoWalkLessonPlan(lectureTitle);
  }
}

export async function handleWalkInterruptScript(
  documentText: string,
  lectureTitle: string,
  segment: WalkSegmentPlan,
  action: WalkInterruptAction,
  style: openai.ExplanationStyle
): Promise<{ script: string; advance: boolean; label: string }> {
  if (action === "skip") {
    return {
      script: "",
      advance: true,
      label: "Skipping to next topic",
    };
  }
  if (action === "continue") {
    return {
      script: segment.script,
      advance: false,
      label: "Continuing",
    };
  }

  const styleGuide = openai.explanationStyleGuide(style);
  const instruction =
    action === "simpler"
      ? "Explain the SAME topic even more simply, slower spoken pace, shorter sentences."
      : "The student said wait / explain again. Re-explain the SAME topic clearly from the start, warm and patient.";

  if (!openai.isOpenAIConfigured()) {
    return {
      script: `${segment.script}\n\nOkay, let me explain that once more in a simpler way. ${segment.title} — think of it step by step.`,
      advance: false,
      label: action === "simpler" ? "Simpler explanation" : "Explained again",
    };
  }

  try {
    const script = await openai.chat(
      `You are a podcast tutor for Sri Lankan students on a walking lesson (earphones).
${styleGuide}
${instruction}
Return ONLY the spoken script text (no markdown). 80-160 words.`,
      `Lecture: ${lectureTitle}
Topic: ${segment.title}
Previous script:
${segment.script}

Context from notes:
${documentText.slice(0, 4000)}`
    );
    return {
      script: script.trim(),
      advance: false,
      label: action === "simpler" ? "Simpler explanation" : "Explained again",
    };
  } catch {
    return {
      script: `Alright, let me say that again. ${segment.script}`,
      advance: false,
      label: "Explained again",
    };
  }
}

export function demoWalkLessonPlan(lectureTitle: string): WalkSegmentPlan[] {
  return [
    {
      title: "Welcome",
      script: `Hey, welcome to your walking lesson on ${lectureTitle}. Put on your earphones, walk at your own pace, and I'll teach you topic by topic like a podcast. If something is unclear, just say wait explain again, or tap the button on your screen.`,
    },
    {
      title: "Big picture",
      script: `First, the big picture. Open your lecture notes mentally and think of three headings from the slides. Everything today connects back to those main ideas. Exams usually test whether you can explain each heading in your own words.`,
    },
    {
      title: "Core concept one",
      script: `Let's dive into the first core concept from your material. Imagine you're explaining to a friend on the way to campus. Define it in one sentence, then give one example from the lecture. That's enough for viva marks.`,
    },
    {
      title: "Core concept two",
      script: `Second core concept now. Compare it to the first one. What's the difference? Students lose marks when they memorise definitions but can't compare. Say it aloud while you walk.`,
    },
    {
      title: "Exam tip",
      script: `Quick exam tip. For each topic, prepare a two minute spoken answer. Start with definition, add example, end with why it matters. Lecturers love clarity more than fancy words.`,
    },
    {
      title: "Wrap up",
      script: `That's your walking session for ${lectureTitle}. Replay any topic with explain again, or revise from your PDF when you're back. Good luck — you've got this.`,
    },
  ];
}
