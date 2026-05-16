import { Router, Response } from "express";
import path from "path";
import fs from "fs";
import { LectureDocument } from "../models/LectureDocument";
import { StudyMaterial } from "../models/StudyMaterial";
import { VivaSession } from "../models/VivaSession";
import { StudySession } from "../models/StudySession";
import { User } from "../models/User";
import { authenticate, loadUser, AuthRequest } from "../middleware/auth";
import { AppError } from "../middleware/errorHandler";
import { env } from "../config/env";
import * as openai from "../services/openai.service";
import {
  textToSpeech,
  isElevenLabsConfigured,
} from "../services/elevenlabs.service";
import {
  ExportFormat,
  buildExportFilename,
  generateExportBuffer,
  getExportMime,
} from "../services/export.service";

const router = Router();

router.use(authenticate, loadUser);

async function getDocumentText(
  documentId: string,
  userId: string
): Promise<{ doc: typeof LectureDocument.prototype; text: string }> {
  const doc = await LectureDocument.findById(documentId);
  if (!doc || doc.status === "removed") {
    throw new AppError("Document not found", 404);
  }
  if (doc.status !== "ready" || !doc.extractedText) {
    throw new AppError("Document is still processing or has no text", 422);
  }
  return { doc, text: doc.extractedText };
}

router.get("/library", async (req: AuthRequest, res, next) => {
  try {
    const materials = await StudyMaterial.find({
      userId: req.user!._id,
      savedToLibrary: true,
    })
      .sort({ updatedAt: -1 })
      .populate("documentId", "title");

    res.json({ success: true, data: materials });
  } catch (e) {
    next(e);
  }
});

router.get("/dashboard", async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!._id;
    const [documents, recentMaterials, vivaSessions, voiceHistory] =
      await Promise.all([
        LectureDocument.find({ uploadedBy: userId, status: { $ne: "removed" } })
          .sort({ createdAt: -1 })
          .limit(10),
        StudyMaterial.find({ userId })
          .sort({ createdAt: -1 })
          .limit(8)
          .populate("documentId", "title"),
        VivaSession.find({ userId }).sort({ updatedAt: -1 }).limit(5),
        StudyMaterial.find({ userId, type: "voice_explanation" })
          .sort({ createdAt: -1 })
          .limit(5),
      ]);

    const [flashcardProgress, studyMinutesWeek, materialsCount] =
      await Promise.all([
        StudyMaterial.aggregate([
          { $match: { userId, type: "flashcards" } },
          { $unwind: "$flashcards" },
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              completed: {
                $sum: { $cond: ["$flashcards.completed", 1, 0] },
              },
            },
          },
        ]),
        StudySession.aggregate([
          {
            $match: {
              userId,
              createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
            },
          },
          { $group: { _id: null, total: { $sum: "$minutes" } } },
        ]),
        StudyMaterial.countDocuments({ userId }),
      ]);

    const u = req.user!;

    res.json({
      success: true,
      data: {
        documents,
        recentMaterials,
        vivaSessions,
        voiceHistory,
        exam: {
          title: u.examTitle,
          date: u.examDate,
        },
        progress: {
          flashcardsTotal: flashcardProgress[0]?.total || 0,
          flashcardsCompleted: flashcardProgress[0]?.completed || 0,
          studyMinutesThisWeek: studyMinutesWeek[0]?.total || 0,
          materialsGenerated: materialsCount,
        },
      },
    });
  } catch (e) {
    next(e);
  }
});

router.patch("/exam", async (req: AuthRequest, res, next) => {
  try {
    const { examTitle, examDate } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user!._id,
      {
        examTitle: examTitle?.trim() || undefined,
        examDate: examDate ? new Date(examDate) : undefined,
      },
      { new: true }
    );
    res.json({
      success: true,
      data: {
        examTitle: user?.examTitle,
        examDate: user?.examDate,
      },
    });
  } catch (e) {
    next(e);
  }
});

router.post("/sessions", async (req: AuthRequest, res, next) => {
  try {
    const { minutes, label, documentId } = req.body;
    if (!minutes || minutes < 1) throw new AppError("Invalid session duration", 400);

    const session = await StudySession.create({
      userId: req.user!._id,
      minutes: Number(minutes),
      label: label || "Focus session",
      documentId,
    });

    res.status(201).json({ success: true, data: session });
  } catch (e) {
    next(e);
  }
});

router.post("/plan/:documentId", async (req: AuthRequest, res, next) => {
  try {
    const { doc, text } = await getDocumentText(
      req.params.documentId,
      req.user!._id.toString()
    );
    const examDate = req.user!.examDate?.toISOString().slice(0, 10);

    let content: string;
    try {
      content = await openai.generateStudyPlan(text, doc.title, examDate);
    } catch {
      content = openai.demoStudyPlan(doc.title);
    }

    const material = await StudyMaterial.create({
      documentId: doc._id,
      userId: req.user!._id,
      type: "study_plan",
      title: `Study Plan: ${doc.title}`,
      content,
    });

    res.status(201).json({ success: true, data: material });
  } catch (e) {
    next(e);
  }
});

router.post("/mcq/:documentId", async (req: AuthRequest, res, next) => {
  try {
    const { doc, text } = await getDocumentText(
      req.params.documentId,
      req.user!._id.toString()
    );

    let questions;
    try {
      questions = await openai.generateMcqQuiz(text, doc.title);
    } catch {
      questions = openai.demoMcqQuiz(doc.title);
    }

    const material = await StudyMaterial.create({
      documentId: doc._id,
      userId: req.user!._id,
      type: "mcq_quiz",
      title: `MCQ Quiz: ${doc.title}`,
      content: "Interactive multiple-choice quiz",
      metadata: { questions },
    });

    res.status(201).json({ success: true, data: material });
  } catch (e) {
    next(e);
  }
});

router.post("/cheat-sheet/:documentId", async (req: AuthRequest, res, next) => {
  try {
    const { doc, text } = await getDocumentText(
      req.params.documentId,
      req.user!._id.toString()
    );

    let content: string;
    try {
      content = await openai.generateCheatSheet(text, doc.title);
    } catch {
      content = openai.demoCheatSheet(doc.title);
    }

    const material = await StudyMaterial.create({
      documentId: doc._id,
      userId: req.user!._id,
      type: "cheat_sheet",
      title: `Cheat Sheet: ${doc.title}`,
      content,
    });

    res.status(201).json({ success: true, data: material });
  } catch (e) {
    next(e);
  }
});

router.post("/flashcards/:documentId", async (req: AuthRequest, res, next) => {
  try {
    const { doc, text } = await getDocumentText(
      req.params.documentId,
      req.user!._id.toString()
    );

    let flashcards;
    try {
      flashcards = await openai.generateFlashcards(text, doc.title);
    } catch {
      flashcards = openai.demoFlashcards();
    }

    const material = await StudyMaterial.create({
      documentId: doc._id,
      userId: req.user!._id,
      type: "flashcards",
      title: `Flashcards: ${doc.title}`,
      content: "Interactive flashcard set",
      flashcards,
    });

    res.status(201).json({ success: true, data: material });
  } catch (e) {
    next(e);
  }
});

router.post("/tamil/:documentId", async (req: AuthRequest, res, next) => {
  try {
    const { doc, text } = await getDocumentText(
      req.params.documentId,
      req.user!._id.toString()
    );
    const lecturerStyle = req.body.lecturerStyle === true;

    let content: string;
    try {
      content = await openai.generateTamilExplanation(
        text,
        doc.title,
        lecturerStyle
      );
    } catch {
      content = `## ${doc.title} — Tamil Explanation (Demo)\n\nமுக்கிய கருத்துகளை உங்கள் lecture notes-லிருந்து படியுங்கள். OPENAI_API_KEY சேர்த்தால் AI Tamil விளக்கம் கிடைக்கும்.`;
    }

    const material = await StudyMaterial.create({
      documentId: doc._id,
      userId: req.user!._id,
      type: lecturerStyle ? "lecturer_tamil" : "tamil_explanation",
      title: lecturerStyle
        ? `Lecturer-style Tamil: ${doc.title}`
        : `Tamil Explanation: ${doc.title}`,
      content,
    });

    res.status(201).json({ success: true, data: material });
  } catch (e) {
    next(e);
  }
});

router.post("/viva/generate/:documentId", async (req: AuthRequest, res, next) => {
  try {
    const { doc, text } = await getDocumentText(
      req.params.documentId,
      req.user!._id.toString()
    );

    let questions: string[];
    try {
      questions = await openai.generateVivaQuestions(text, doc.title);
    } catch {
      questions = [
        `Explain the main concept in ${doc.title}.`,
        `Give one example related to ${doc.title}.`,
        `What would you revise before the viva for this topic?`,
      ];
    }

    const session = await VivaSession.create({
      documentId: doc._id,
      userId: req.user!._id,
      title: `Mock Viva: ${doc.title}`,
      questions: questions.map((q) => ({ question: q })),
      currentIndex: 0,
      status: "active",
    });

    const material = await StudyMaterial.create({
      documentId: doc._id,
      userId: req.user!._id,
      type: "viva_questions",
      title: `Viva Questions: ${doc.title}`,
      content: questions.join("\n"),
      metadata: { sessionId: session._id },
    });

    res.status(201).json({
      success: true,
      data: { session, material },
    });
  } catch (e) {
    next(e);
  }
});

router.get("/viva/:sessionId", async (req: AuthRequest, res, next) => {
  try {
    const session = await VivaSession.findOne({
      _id: req.params.sessionId,
      userId: req.user!._id,
    });
    if (!session) throw new AppError("Viva session not found", 404);
    res.json({ success: true, data: session });
  } catch (e) {
    next(e);
  }
});

router.post("/viva/:sessionId/answer", async (req: AuthRequest, res, next) => {
  try {
    const { answer } = req.body;
    if (!answer?.trim()) throw new AppError("Answer is required", 400);

    const session = await VivaSession.findOne({
      _id: req.params.sessionId,
      userId: req.user!._id,
    });
    if (!session || session.status === "completed") {
      throw new AppError("Viva session not found or completed", 404);
    }

    const idx = session.currentIndex;
    const currentQ = session.questions[idx];
    if (!currentQ) throw new AppError("No more questions", 400);

    let context = "";
    if (session.documentId) {
      const doc = await LectureDocument.findById(session.documentId);
      context = doc?.extractedText || "";
    }

    const evaluation = await openai.evaluateVivaAnswer(
      currentQ.question,
      answer,
      context
    );

    currentQ.studentAnswer = answer;
    currentQ.feedback = evaluation.feedback;
    currentQ.score = evaluation.score;
    session.questions[idx] = currentQ;

    if (idx + 1 >= session.questions.length) {
      session.status = "completed";
      session.currentIndex = idx;
      const avg =
        session.questions.reduce((s, q) => s + (q.score || 0), 0) /
        session.questions.length;
      session.overallFeedback =
        avg >= 7
          ? "Excellent viva practice! You are well prepared."
          : avg >= 5
            ? "Good effort. Revise weak answers and add examples."
            : "Keep revising. Focus on definitions and one example per answer.";
    } else {
      session.currentIndex = idx + 1;
    }

    await session.save();
    res.json({ success: true, data: session });
  } catch (e) {
    next(e);
  }
});

router.post("/voice/:documentId", async (req: AuthRequest, res, next) => {
  try {
    const { doc, text } = await getDocumentText(
      req.params.documentId,
      req.user!._id.toString()
    );

    let explanation: string | undefined;
    const sourceMaterialId = req.body.materialId;

    if (sourceMaterialId) {
      const source = await StudyMaterial.findOne({
        _id: sourceMaterialId,
        userId: req.user!._id,
      });
      explanation = source?.content;
    }

    if (!explanation) {
      try {
        explanation = await openai.generateTamilExplanation(text, doc.title, true);
      } catch {
        explanation = `Voice explanation for ${doc.title}. Configure OPENAI and ElevenLabs for full experience.`;
      }
    }

    let audioPath: string | undefined;
    let audioUrl: string | undefined;
    let voiceMode: "elevenlabs" | "browser" = "browser";
    let voiceError: string | undefined;
    const elevenlabsConfigured = isElevenLabsConfigured();

    if (!elevenlabsConfigured) {
      voiceError = "Add ELEVENLABS_API_KEY to server/.env";
    } else {
      try {
        const audio = await textToSpeech(explanation);
        if (audio) {
          audioPath = audio.audioPath;
          audioUrl = audio.audioUrl;
          voiceMode = "elevenlabs";
        }
      } catch (voiceErr) {
        voiceError =
          voiceErr instanceof AppError
            ? voiceErr.message
            : voiceErr instanceof Error
              ? voiceErr.message
              : "ElevenLabs request failed";
        console.warn("ElevenLabs request failed:", voiceErr);
      }
    }

    const material = await StudyMaterial.create({
      documentId: doc._id,
      userId: req.user!._id,
      type: "voice_explanation",
      title: `Voice: ${doc.title}`,
      content: explanation,
      audioPath,
      audioUrl,
      metadata: {
        voiceMode,
        elevenlabsConfigured,
        voiceError,
      },
    });

    res.status(201).json({
      success: true,
      data: material,
      voiceMode,
      voiceError,
      message:
        voiceMode === "elevenlabs"
          ? "Voice generated with ElevenLabs."
          : elevenlabsConfigured
            ? `ElevenLabs could not generate audio: ${voiceError}. Use Play below or try again.`
            : "Add ELEVENLABS_API_KEY to server/.env for ElevenLabs audio.",
    });
  } catch (e) {
    next(e);
  }
});

router.patch("/materials/:id/save", async (req: AuthRequest, res, next) => {
  try {
    const material = await StudyMaterial.findOneAndUpdate(
      { _id: req.params.id, userId: req.user!._id },
      { savedToLibrary: true },
      { new: true }
    );
    if (!material) throw new AppError("Material not found", 404);
    res.json({ success: true, data: material });
  } catch (e) {
    next(e);
  }
});

router.patch(
  "/flashcards/:materialId/:cardId",
  async (req: AuthRequest, res, next) => {
    try {
      const material = await StudyMaterial.findOne({
        _id: req.params.materialId,
        userId: req.user!._id,
        type: "flashcards",
      });
      if (!material?.flashcards) throw new AppError("Flashcards not found", 404);

      const card = material.flashcards.find(
        (c) => String(c._id) === req.params.cardId
      );
      if (!card) throw new AppError("Card not found", 404);
      card.completed = req.body.completed !== false;
      await material.save();

      res.json({ success: true, data: material });
    } catch (e) {
      next(e);
    }
  }
);

router.get("/materials/:id/download", async (req: AuthRequest, res, next) => {
  try {
    const material = await StudyMaterial.findOne({
      _id: req.params.id,
      userId: req.user!._id,
    });
    if (!material) throw new AppError("Material not found", 404);

    const rawFormat = String(req.query.format || "pdf").toLowerCase();
    const format: ExportFormat =
      rawFormat === "docx" || rawFormat === "word"
        ? "docx"
        : rawFormat === "md" || rawFormat === "markdown"
          ? "md"
          : "pdf";

    const buffer = await generateExportBuffer(
      {
        title: material.title,
        content: material.content,
        flashcards: material.flashcards,
      },
      format
    );

    const filename = buildExportFilename(material.title, format);
    res.setHeader("Content-Type", getExportMime(format));
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (e) {
    next(e);
  }
});

export default router;
