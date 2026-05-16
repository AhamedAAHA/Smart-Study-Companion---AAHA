import { Router, Response } from "express";
import path from "path";
import fs from "fs";
import { LectureDocument } from "../models/LectureDocument";
import { authenticate, loadUser, authorize, AuthRequest } from "../middleware/auth";
import { uploadLecture } from "../middleware/upload";
import { extractTextFromPdf, extractTitleFromFilename } from "../services/pdf.service";
import { AppError } from "../middleware/errorHandler";

const router = Router();

router.use(authenticate, loadUser);

router.get("/", async (req: AuthRequest, res, next) => {
  try {
    const filter =
      req.user!.role === "student"
        ? { uploadedBy: req.user!._id, status: { $ne: "removed" } }
        : { status: { $ne: "removed" } };

    const docs = await LectureDocument.find(filter)
      .sort({ createdAt: -1 })
      .populate("uploadedBy", "name email role");

    res.json({ success: true, data: docs });
  } catch (e) {
    next(e);
  }
});

router.get("/:id", async (req: AuthRequest, res, next) => {
  try {
    const doc = await LectureDocument.findById(req.params.id).populate(
      "uploadedBy",
      "name email"
    );
    if (!doc || doc.status === "removed") {
      throw new AppError("Document not found", 404);
    }
    res.json({ success: true, data: doc });
  } catch (e) {
    next(e);
  }
});

router.post(
  "/upload",
  authorize("student", "lecturer"),
  uploadLecture.single("file"),
  async (req: AuthRequest, res: Response, next) => {
    try {
      if (!req.file) throw new AppError("No file uploaded", 400);

      const title =
        (req.body.title as string)?.trim() ||
        extractTitleFromFilename(req.file.originalname);

      const lectureDoc = await LectureDocument.create({
        title,
        originalFilename: req.file.originalname,
        filePath: req.file.path,
        mimeType: req.file.mimetype,
        fileSize: req.file.size,
        uploadedBy: req.user!._id,
        uploaderRole: req.user!.role === "lecturer" ? "lecturer" : "student",
        module: req.body.module,
        status: "processing",
        approvedByLecturer: req.user!.role === "lecturer",
      });

      if (
        req.file.mimetype === "application/pdf" ||
        req.file.originalname.toLowerCase().endsWith(".pdf")
      ) {
        lectureDoc.extractedText = await extractTextFromPdf(
          req.file.path,
          title
        );
      } else {
        lectureDoc.extractedText =
          `[PowerPoint uploaded: ${req.file.originalname}]\n\nFor full AI processing, export slides to PDF. Demo text: Review key concepts from ${title} — definitions, diagrams, and examples from your lecture.`;
      }

      lectureDoc.status = "ready";
      await lectureDoc.save();

      res.status(201).json({ success: true, data: lectureDoc });
    } catch (e) {
      next(e);
    }
  }
);

router.patch(
  "/:id/approve",
  authorize("lecturer", "admin"),
  async (req: AuthRequest, res, next) => {
    try {
      const doc = await LectureDocument.findByIdAndUpdate(
        req.params.id,
        { approvedByLecturer: true },
        { new: true }
      );
      if (!doc) throw new AppError("Document not found", 404);
      res.json({ success: true, data: doc });
    } catch (e) {
      next(e);
    }
  }
);

router.delete(
  "/:id",
  authorize("admin", "lecturer"),
  async (req: AuthRequest, res, next) => {
    try {
      const doc = await LectureDocument.findById(req.params.id);
      if (!doc) throw new AppError("Document not found", 404);

      if (fs.existsSync(doc.filePath)) fs.unlinkSync(doc.filePath);
      doc.status = "removed";
      await doc.save();

      res.json({ success: true, message: "Document removed" });
    } catch (e) {
      next(e);
    }
  }
);

export default router;
