import { ExplanationStyle, SriLankanMixMode } from "@/types";

export const SRI_LANKAN_MIX_MODES: {
  mode: SriLankanMixMode;
  label: string;
  short: string;
  example: string;
}[] = [
  {
    mode: "tamil_english",
    label: "Tamil–English mix",
    short: "Tamil",
    example: '"Semaphore na basically oru resource access control system."',
  },
  {
    mode: "sinhala_english",
    label: "Sinhala–English mix",
    short: "Sinhala",
    example: '"Semaphore eka basically resource access control system ekak."',
  },
  {
    mode: "student_lk",
    label: "Sri Lankan student style",
    short: "Student LK",
    example: '"Semaphore is basically — resource access control, very simple."',
  },
];

export const EXPLANATION_STYLE_OPTIONS: {
  value: ExplanationStyle;
  label: string;
}[] = [
  { value: "english", label: "English" },
  { value: "tamil", label: "Tamil (formal mix)" },
  { value: "both", label: "English + Tamil points" },
  { value: "tamil_english", label: "Tamil–English mix" },
  { value: "sinhala_english", label: "Sinhala–English mix" },
  { value: "student_lk", label: "Sri Lankan student style" },
];

export function getMixModeLabel(mode: SriLankanMixMode): string {
  return SRI_LANKAN_MIX_MODES.find((m) => m.mode === mode)?.label ?? mode;
}

export function getExplanationStyleLabel(style: ExplanationStyle): string {
  return EXPLANATION_STYLE_OPTIONS.find((o) => o.value === style)?.label ?? style;
}

/** Single picker for Sri Lankan language study tools */
export type LanguageToolId =
  | SriLankanMixMode
  | "tamil_explanation"
  | "lecturer_tamil"
  | "english_voice";

export const LANGUAGE_TOOL_OPTIONS: {
  id: LanguageToolId;
  label: string;
  hint: string;
}[] = [
  ...SRI_LANKAN_MIX_MODES.map((m) => ({
    id: m.mode as LanguageToolId,
    label: m.label,
    hint: m.example,
  })),
  {
    id: "tamil_explanation",
    label: "Tamil explanation",
    hint: "Simple Tamil with English technical terms",
  },
  {
    id: "lecturer_tamil",
    label: "Lecturer Tamil",
    hint: "Warm lecture-style Tamil explanation",
  },
  {
    id: "english_voice",
    label: "English voice lesson",
    hint: "Clear English explanation with spoken audio",
  },
];

export function getLanguageToolLabel(id: LanguageToolId): string {
  return LANGUAGE_TOOL_OPTIONS.find((o) => o.id === id)?.label ?? id;
}
