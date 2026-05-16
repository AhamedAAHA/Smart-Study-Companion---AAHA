import { SriLankanMixMode } from "@/types";
import { getMixModeLabel } from "./localeLabels";

export const MATERIAL_TYPE_LABELS: Record<string, string> = {
  cheat_sheet: "Cheat sheet",
  flashcards: "Flashcards",
  tamil_explanation: "Tamil explanation",
  lecturer_tamil: "Lecturer Tamil",
  localized_explanation: "Sri Lankan mix",
  viva_questions: "Mock viva",
  voice_explanation: "Voice lesson",
  doubt_explanation: "Doubt answered",
  study_plan: "Study plan",
  mcq_quiz: "MCQ quiz",
};

export function getMaterialTypeLabel(
  type: string,
  mixMode?: SriLankanMixMode
): string {
  if (type === "localized_explanation" && mixMode) {
    return getMixModeLabel(mixMode);
  }
  return MATERIAL_TYPE_LABELS[type] || type.replace(/_/g, " ");
}
