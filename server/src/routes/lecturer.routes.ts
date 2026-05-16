import { Router, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";
import { LectureDocument } from "../models/LectureDocument";
import { StudyMaterial } from "../models/StudyMaterial";
import { VivaSession } from "../models/VivaSession";
import {
  authenticate,
  loadUser,
  authorize,
  AuthRequest,
} from "../middleware/auth";
import { AppError } from "../middleware/errorHandler";
import * as openai from "../services/openai.service";

const router = Router();

router.use(authenticate, loadUser, authorize("lecturer", "admin"));

router.get("/documents", async (_req, res, next) => {
  try {
    const docs = await LectureDocument.find({ status: { $ne: "removed" } })
      .sort({ createdAt: -1 })
      .populate("uploadedBy", "name email");
    res.json({ success: true, data: docs });
  } catch (e) {
    next(e);
  }
});

router.post("/summarize/:documentId", async (req: AuthRequest, res, next) => {
  try {
    const doc = await LectureDocument.findById(req.params.documentId);
    if (!doc?.extractedText) throw new AppError("Document not ready", 422);

    let summary: string;
    try {
      summary = await openai.summarizeForLecturer(doc.extractedText, doc.title);
    } catch {
      summary = `Summary for ${doc.title}: Review extracted content and approve for students.`;
    }

    res.json({ success: true, data: { summary, document: doc } });
  } catch (e) {
    next(e);
  }
});

router.post(
  "/viva-sets",
  [body("title").trim().notEmpty(), body("questions").isArray({ min: 1 })],
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) throw new AppError("Invalid viva set data", 400);

      const { title, topic, questions, module } = req.body;

      const session = await VivaSession.create({
        userId: req.user!._id,
        title,
        topic: topic || module,
        questions: questions.map((q: string) => ({ question: q })),
        createdByLecturer: true,
        status: "active",
      });

      res.status(201).json({ success: true, data: session });
    } catch (e) {
      next(e);
    }
  }
);

router.get("/materials/pending", async (_req, res, next) => {
  try {
    const pending = await LectureDocument.find({
      approvedByLecturer: false,
      status: "ready",
    }).populate("uploadedBy", "name email");

    res.json({ success: true, data: pending });
  } catch (e) {
    next(e);
  }
});

export default router;
