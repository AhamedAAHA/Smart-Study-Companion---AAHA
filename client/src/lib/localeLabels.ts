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
