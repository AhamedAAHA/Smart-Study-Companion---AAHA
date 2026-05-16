import fs from "fs";
import path from "path";
import pdfParse from "pdf-parse";
import { AppError } from "../middleware/errorHandler";

function buildFallbackPdfText(title: string): string {
  return `[Uploaded PDF: ${title}]

Text extraction found little or no selectable text (common with scanned slides).
You can still use study tools — AI will work from the lecture title and any text we could read.
For best results, export slides as a text-based PDF from PowerPoint or Word.`;
}

export async function extractTextFromPdf(
  filePath: string,
  title?: string
): Promise<string> {
  if (!fs.existsSync(filePath)) {
    throw new AppError("File not found", 404);
  }

  const label = title || path.basename(filePath);

  try {
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    const text = data.text?.trim() || "";

    if (text.length >= 50) {
      return text.slice(0, 50000);
    }
  } catch (err) {
    console.warn("PDF parse warning:", err);
  }

  return buildFallbackPdfText(label);
}

export function extractTitleFromFilename(filename: string): string {
  return filename
    .replace(/\.[^/.]+$/, "")
    .replace(/[-_]/g, " ")
    .trim();
}
