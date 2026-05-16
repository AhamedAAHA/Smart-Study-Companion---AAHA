import { Router, Response } from "express";
import path from "path";
import fs from "fs";
import { LectureDocument } from "../models/LectureDocument";
import { StudyMaterial } from "../models/StudyMaterial";
import { VivaSession } from "../models/VivaSession";
import { WalkSession, IWalkSegment } from "../models/WalkSession";
import { StudySession } from "../models/StudySession";
import { User } from "../models/User";
import { authenticate, loadUser, AuthRequest } from "../middleware/auth";
import { AppError } from "../middleware/errorHandler";
import { env } from "../config/env";
import * as openai from "../services/openai.service";
import {
  textToSpeech,
  isElevenLabsConfigured,
  speechTranscriptFromMarkdown,
} from "../services/elevenlabs.service";
import {
  buildVoiceMetadata,
  queueMaterialAudio,
} from "../services/materialAudio.service";
import { transcribeAudioFile } from "../services/transcription.service";
import * as walk from "../services/walk.service";
import { uploadDoubtAudio } from "../middleware/upload";
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

  if (doc.uploadedBy.toString() !== userId) {
    throw new AppError("You do not have access to this document", 403);
  }

  if (doc.status === "processing") {
    throw new AppError(
      "Document is still processing. Wait a moment and try again.",
      422
    );
  }

  const text = doc.extractedText?.trim() || "";

  if (doc.status === "failed" && text.length < 20) {
    throw new AppError(
      "Could not read this file. Upload a text-based PDF (not a scanned image), or export PowerPoint to PDF.",
      422
    );
  }

  if (text.length < 20) {
    throw new AppError(
      "Not enough text in this document for AI tools. Re-upload a PDF with selectable text.",
      422
    );
  }

  return { doc, text };
}

type VoiceSynthResult = {
  audioPath?: string;
  audioUrl?: string;
  voiceMode: "elevenlabs" | "browser";
  voiceError?: string;
  elevenlabsConfigured: boolean;
  transcript: string;
  speechRate?: number;
};

async function synthesizeVoiceFromText(
  explanation: string,
  speechRate = 1
): Promise<VoiceSynthResult> {
  const transcript = speechTranscriptFromMarkdown(explanation);
  let audioPath: string | undefined;
  let audioUrl: string | undefined;
  let voiceMode: "elevenlabs" | "browser" = "browser";
  let voiceError: string | undefined;
  const elevenlabsConfigured = isElevenLabsConfigured();

  if (!elevenlabsConfigured) {
    voiceError = "Add ELEVENLABS_API_KEY to server/.env for ElevenLabs audio";
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
      console.warn("Voice generation failed:", voiceErr);
    }
  }

  return {
    audioPath,
    audioUrl,
    voiceMode,
    voiceError,
    elevenlabsConfigured,
    transcript,
    speechRate: speechRate !== 1 ? speechRate : undefined,
  };
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

    const content = await openai.generateCheatSheet(text, doc.title);

    if (!content?.trim()) {
      throw new AppError("Cheat sheet generation returned empty content", 502);
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

router.post("/localize/:documentId", async (req: AuthRequest, res, next) => {
  try {
    const mode = req.body.mode as openai.SriLankanMixMode;
    const allowed: openai.SriLankanMixMode[] = [
      "tamil_english",
      "sinhala_english",
      "student_lk",
    ];
    if (!allowed.includes(mode)) {
      throw new AppError(
        "Invalid mix mode. Use tamil_english, sinhala_english, or student_lk.",
        400
      );
    }

    const { doc, text } = await getDocumentText(
      req.params.documentId,
      req.user!._id.toString()
    );

    const content = await openai.generateSriLankanMixExplanation(
      text,
      doc.title,
      mode
    );

    const material = await createMaterialWithVoice({
      documentId: doc._id,
      userId: req.user!._id,
      type: "localized_explanation",
      title: openai.localizedExplanationTitle(doc.title, mode),
      content,
      metadata: { mixMode: mode, explanationStyle: mode },
    });

    res.status(201).json({
      success: true,
      data: material,
      message: "Explanation ready with text, audio, and transcript.",
    });
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

    const material = await createMaterialWithVoice({
      documentId: doc._id,
      userId: req.user!._id,
      type: lecturerStyle ? "lecturer_tamil" : "tamil_explanation",
      title: lecturerStyle
        ? `Lecturer-style Tamil: ${doc.title}`
        : `Tamil Explanation: ${doc.title}`,
      content,
      metadata: { lecturerStyle, explanationStyle: "tamil" },
    });

    res.status(201).json({
      success: true,
      data: material,
      message: "Tamil explanation with text, audio, and transcript.",
    });
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

function optionalDoubtAudioUpload(
  req: AuthRequest,
  res: Response,
  next: (err?: unknown) => void
) {
  const contentType = req.headers["content-type"] || "";
  if (contentType.includes("multipart/form-data")) {
    uploadDoubtAudio.single("audio")(req, res, next);
    return;
  }
  next();
}

router.post(
  "/doubt/:documentId",
  optionalDoubtAudioUpload,
  async (req: AuthRequest, res, next) => {
    try {
      let doubt = String(req.body.doubt || "").trim();
      let inputMode: "text" | "voice" =
        req.body.inputMode === "voice" ? "voice" : "text";
      let questionTranscript: string | undefined;

      const audioFile = req.file as Express.Multer.File | undefined;
      const documentId = req.params.documentId;
      const userId = req.user!._id.toString();

      const docTextPromise = getDocumentText(documentId, userId);
      const userPromise = User.findById(req.user!._id);

      /** Browser live captions are usually good enough — skip Whisper (~3–8s). */
      const skipWhisper = Boolean(audioFile && doubt.length >= 8);

      const whisperLang =
        req.body.language === "tamil" || req.body.language === "both"
          ? "ta"
          : undefined;

      const whisperPromise =
        audioFile && !skipWhisper
          ? transcribeAudioFile(audioFile.path, whisperLang)
          : null;

      if (audioFile) {
        inputMode = "voice";
        if (skipWhisper) {
          questionTranscript = doubt;
          fs.unlink(audioFile.path, () => undefined);
        }
      } else if (inputMode === "voice" && doubt) {
        questionTranscript = doubt;
      }

      const [{ doc, text }, user, whisperText] = await Promise.all([
        docTextPromise,
        userPromise,
        whisperPromise ?? Promise.resolve(null as string | null),
      ]);

      if (audioFile && !skipWhisper) {
        fs.unlink(audioFile.path, () => undefined);
        if (whisperText) {
          questionTranscript = whisperText;
          if (!doubt) doubt = whisperText;
        }
      }

      if (!doubt) {
        throw new AppError(
          "Please describe your doubt in text or record a voice question.",
          400
        );
      }
      if (doubt.length > 2000) {
        throw new AppError("Doubt text is too long (max 2000 characters).", 400);
      }

      const language =
        (req.body.language as openai.DoubtLanguage) ||
        (user?.preferredLanguage as openai.DoubtLanguage) ||
        "both";

      let explanation: string;
      try {
        explanation = await openai.generateDoubtExplanation(
          text,
          doc.title,
          doubt,
          language
        );
      } catch {
        explanation = openai.demoDoubtExplanation(doc.title, doubt);
      }

    const material = await StudyMaterial.create({
      documentId: doc._id,
      userId: req.user!._id,
      type: "doubt_explanation",
      title: `Doubt: ${doc.title}`,
      content: explanation,
      metadata: buildVoiceMetadata(explanation, {
        doubt,
        questionTranscript: questionTranscript || doubt,
        inputMode,
        language,
      }),
    });

    if (isElevenLabsConfigured()) {
      queueMaterialAudio(material._id.toString());
    }

      res.status(201).json({
        success: true,
        data: material,
      voiceMode: "browser",
      message: isElevenLabsConfigured()
        ? "Doubt explained in text. Premium audio is generating in the background."
        : "Doubt explained in text with transcript. Use Play for browser voice or add ElevenLabs for premium audio.",
    });
  } catch (e) {
    next(e);
  }
  }
);

router.post(
  "/materials/:materialId/voice-refine",
  async (req: AuthRequest, res, next) => {
    try {
      const mode = req.body.mode as openai.VoiceRefineMode;
      const allowed: openai.VoiceRefineMode[] = [
        "simpler",
        "real_life",
        "tamil",
        "tamil_english",
        "sinhala_english",
        "student_lk",
        "slow",
        "repeat",
      ];
      if (!allowed.includes(mode)) {
        throw new AppError("Invalid voice tutor mode", 400);
      }

      const material = await StudyMaterial.findOne({
        _id: req.params.materialId,
        userId: req.user!._id,
        type: { $in: ["voice_explanation", "doubt_explanation"] },
      });

      if (!material) {
        throw new AppError("Voice explanation not found", 404);
      }

      const { doc, text } = await getDocumentText(
        material.documentId.toString(),
        req.user!._id.toString()
      );

      const explanation = await openai.refineVoiceExplanation(
        text,
        doc.title,
        material.content,
        mode
      );

      const speechRate = mode === "slow" ? 0.82 : 1;

      material.content = explanation;
      material.audioPath = undefined;
      material.audioUrl = undefined;
      material.metadata = {
        ...((material.metadata as Record<string, unknown>) || {}),
        ...buildVoiceMetadata(explanation),
        lastRefineMode: mode,
        speechRate: speechRate !== 1 ? speechRate : undefined,
      };
      await material.save();

      if (isElevenLabsConfigured()) {
        queueMaterialAudio(material._id.toString(), { speechRate });
      }

      res.json({
        success: true,
        data: material,
        voiceMode: "browser",
        message: isElevenLabsConfigured()
          ? "Tutor updated your explanation. Premium audio is generating."
          : "Tutor updated your explanation. Use browser play for audio.",
      });
    } catch (e) {
      next(e);
    }
  }
);

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

    const material = await StudyMaterial.create({
      documentId: doc._id,
      userId: req.user!._id,
      type: "voice_explanation",
      title: `Voice: ${doc.title}`,
      content: explanation,
      metadata: buildVoiceMetadata(explanation),
    });

    if (isElevenLabsConfigured()) {
      queueMaterialAudio(material._id.toString());
    }

    res.status(201).json({
      success: true,
      data: material,
      voiceMode: "browser",
      message: isElevenLabsConfigured()
        ? "Voice lesson ready in text. Premium audio is generating."
        : "Voice lesson ready in text. Use Play below or add ElevenLabs for premium audio.",
    });
  } catch (e) {
    next(e);
  }
});

router.get("/materials/:id", async (req: AuthRequest, res, next) => {
  try {
    const material = await StudyMaterial.findOne({
      _id: req.params.id,
      userId: req.user!._id,
    });
    if (!material) throw new AppError("Material not found", 404);
    res.json({ success: true, data: material });
  } catch (e) {
    next(e);
  }
});

router.post("/materials/:id/audio", async (req: AuthRequest, res, next) => {
  try {
    const material = await StudyMaterial.findOne({
      _id: req.params.id,
      userId: req.user!._id,
    });
    if (!material) throw new AppError("Material not found", 404);

    if (!material.audioUrl && isElevenLabsConfigured()) {
      await StudyMaterial.findByIdAndUpdate(material._id, {
        $set: { "metadata.audioPending": true },
      });
      queueMaterialAudio(material._id.toString(), {
        speechRate: (material.metadata as { speechRate?: number })?.speechRate,
      });
    }

    const refreshed = await StudyMaterial.findById(material._id);
    res.json({ success: true, data: refreshed });
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
    res.setHeader("Content-Length", String(buffer.length));
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`
    );
    res.setHeader("Access-Control-Expose-Headers", "Content-Disposition, Content-Type");
    res.send(buffer);
  } catch (e) {
    next(e);
  }
});

async function createMaterialWithVoice(opts: {
  documentId: typeof LectureDocument.prototype._id;
  userId: typeof User.prototype._id;
  type: string;
  title: string;
  content: string;
  metadata?: Record<string, unknown>;
}) {
  const material = await StudyMaterial.create({
    documentId: opts.documentId,
    userId: opts.userId,
    type: opts.type,
    title: opts.title,
    content: opts.content,
    metadata: buildVoiceMetadata(opts.content, opts.metadata),
  });

  if (isElevenLabsConfigured()) {
    queueMaterialAudio(material._id.toString());
  }

  return material;
}

async function synthesizeSegmentAudio(
  session: InstanceType<typeof WalkSession>,
  index: number
): Promise<IWalkSegment> {
  const seg = session.segments[index];
  if (!seg) throw new AppError("Segment not found", 404);
  if (seg.audioUrl) return seg;

  const voice = await synthesizeVoiceFromText(seg.script);
  session.segments[index].audioPath = voice.audioPath;
  session.segments[index].audioUrl = voice.audioUrl;
  session.markModified("segments");
  await session.save();
  return session.segments[index];
}

router.post("/walk/start/:documentId", async (req: AuthRequest, res, next) => {
  try {
    const { doc, text } = await getDocumentText(
      req.params.documentId,
      req.user!._id.toString()
    );

    const user = await User.findById(req.user!._id);
    const explanationStyle =
      (req.body.style as openai.ExplanationStyle) ||
      (user?.preferredLanguage as openai.ExplanationStyle) ||
      "tamil_english";

    const plan = await walk.generateWalkLessonPlan(
      text,
      doc.title,
      explanationStyle
    );

    const segments: IWalkSegment[] = plan.map((p, i) => ({
      index: i,
      title: p.title,
      script: p.script,
    }));

    const session = await WalkSession.create({
      documentId: doc._id,
      userId: req.user!._id,
      title: `Walk & Learn: ${doc.title}`,
      segments,
      currentIndex: 0,
      status: "active",
      explanationStyle,
    });

    res.status(201).json({
      success: true,
      data: session,
      message: "Walking lesson ready. Plug in earphones and press play.",
    });
  } catch (e) {
    next(e);
  }
});

router.get("/walk/:sessionId", async (req: AuthRequest, res, next) => {
  try {
    const session = await WalkSession.findOne({
      _id: req.params.sessionId,
      userId: req.user!._id,
    });
    if (!session) throw new AppError("Walk session not found", 404);
    res.json({ success: true, data: session });
  } catch (e) {
    next(e);
  }
});

router.post(
  "/walk/:sessionId/prepare/:index",
  async (req: AuthRequest, res, next) => {
    try {
      const session = await WalkSession.findOne({
        _id: req.params.sessionId,
        userId: req.user!._id,
        status: "active",
      });
      if (!session) throw new AppError("Walk session not found", 404);

      const index = Number(req.params.index);
      if (Number.isNaN(index) || index < 0 || index >= session.segments.length) {
        throw new AppError("Invalid segment index", 400);
      }

      await synthesizeSegmentAudio(session, index);
      const refreshed = await WalkSession.findById(session._id);
      res.json({ success: true, data: refreshed });
    } catch (e) {
      next(e);
    }
  }
);

router.post(
  "/walk/:sessionId/advance",
  async (req: AuthRequest, res, next) => {
    try {
      const session = await WalkSession.findOne({
        _id: req.params.sessionId,
        userId: req.user!._id,
        status: "active",
      });
      if (!session) throw new AppError("Walk session not found", 404);

      const nextIndex = session.currentIndex + 1;
      if (nextIndex >= session.segments.length) {
        session.status = "completed";
        await session.save();
        return res.json({
          success: true,
          data: session,
          completed: true,
          message: "Walking lesson complete. Great job!",
        });
      }

      session.currentIndex = nextIndex;
      await session.save();
      await synthesizeSegmentAudio(session, nextIndex);
      const refreshed = await WalkSession.findById(session._id);

      res.json({
        success: true,
        data: refreshed,
        completed: false,
      });
    } catch (e) {
      next(e);
    }
  }
);

function optionalWalkInterruptAudio(
  req: AuthRequest,
  res: Response,
  next: (err?: unknown) => void
) {
  const contentType = req.headers["content-type"] || "";
  if (contentType.includes("multipart/form-data")) {
    uploadDoubtAudio.single("audio")(req, res, next);
    return;
  }
  next();
}

router.post(
  "/walk/:sessionId/interrupt",
  optionalWalkInterruptAudio,
  async (req: AuthRequest, res, next) => {
    try {
      const session = await WalkSession.findOne({
        _id: req.params.sessionId,
        userId: req.user!._id,
        status: "active",
      });
      if (!session) throw new AppError("Walk session not found", 404);

      const { doc, text } = await getDocumentText(
        session.documentId.toString(),
        req.user!._id.toString()
      );

      let action =
        (req.body.action as walk.WalkInterruptAction) || undefined;
      let transcript = String(req.body.transcript || "").trim();

      const audioFile = req.file as Express.Multer.File | undefined;
      if (audioFile) {
        try {
          transcript = await transcribeAudioFile(audioFile.path);
        } finally {
          fs.unlink(audioFile.path, () => undefined);
        }
      }

      if (!action && transcript) {
        const parsed = walk.parseWalkInterruptCommand(transcript);
        if (parsed) action = parsed;
      }

      const resolvedAction: walk.WalkInterruptAction =
        action || "explain_again";

      const finalAction =
        resolvedAction === "repeat" ? "explain_again" : resolvedAction;

      const idx = session.currentIndex;
      const current = session.segments[idx];
      if (!current) throw new AppError("No current segment", 400);

      if (finalAction === "continue") {
        return res.json({
          success: true,
          data: session,
          label: "Continuing",
          currentIndex: idx,
        });
      }

      const result = await walk.handleWalkInterruptScript(
        text,
        doc.title,
        { title: current.title, script: current.script },
        finalAction,
        session.explanationStyle as openai.ExplanationStyle
      );

      if (result.advance) {
        const nextIndex = idx + 1;
        if (nextIndex >= session.segments.length) {
          session.status = "completed";
          await session.save();
          return res.json({
            success: true,
            data: session,
            completed: true,
            label: result.label,
            message: "Lesson complete.",
          });
        }
        session.currentIndex = nextIndex;
        await session.save();
        await synthesizeSegmentAudio(session, nextIndex);
        const refreshed = await WalkSession.findById(session._id);
        return res.json({
          success: true,
          data: refreshed,
          label: result.label,
          currentIndex: nextIndex,
        });
      }

      session.segments[idx].script = result.script;
      session.segments[idx].audioPath = undefined;
      session.segments[idx].audioUrl = undefined;
      session.markModified("segments");
      await session.save();
      await synthesizeSegmentAudio(session, idx);
      const refreshed = await WalkSession.findById(session._id);

      res.json({
        success: true,
        data: refreshed,
        label: result.label,
        currentIndex: idx,
        heard: transcript || undefined,
      });
    } catch (e) {
      next(e);
    }
  }
);

export default router;
