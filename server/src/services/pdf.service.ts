import fs from "fs";
import pdfParse from "pdf-parse";
import { AppError } from "../middleware/errorHandler";

export async function extractTextFromPdf(filePath: string): Promise<string> {
  if (!fs.existsSync(filePath)) {
    throw new AppError("File not found", 404);
  }

  const buffer = fs.readFileSync(filePath);
  const data = await pdfParse(buffer);
  const text = data.text?.trim();

  if (!text || text.length < 50) {
    throw new AppError(
      "Could not extract enough text from this document. Try a text-based PDF.",
      422
    );
  }

  return text.slice(0, 50000);
}

export function extractTitleFromFilename(filename: string): string {
  return filename
    .replace(/\.[^/.]+$/, "")
    .replace(/[-_]/g, " ")
    .trim();
}
