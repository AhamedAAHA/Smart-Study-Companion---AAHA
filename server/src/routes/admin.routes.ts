import { Router } from "express";
import { User } from "../models/User";
import { LectureDocument } from "../models/LectureDocument";
import { StudyMaterial } from "../models/StudyMaterial";
import {
  authenticate,
  loadUser,
  authorize,
  AuthRequest,
} from "../middleware/auth";
import { AppError } from "../middleware/errorHandler";

const router = Router();

router.use(authenticate, loadUser, authorize("admin"));

router.get("/stats", async (_req, res, next) => {
  try {
    const [
      totalStudents,
      totalLecturers,
      totalDocuments,
      cheatSheets,
      voiceExplanations,
      flashcardSets,
      vivaSessions,
    ] = await Promise.all([
      User.countDocuments({ role: "student", isActive: true }),
      User.countDocuments({ role: "lecturer", isActive: true }),
      LectureDocument.countDocuments({ status: { $ne: "removed" } }),
      StudyMaterial.countDocuments({ type: "cheat_sheet" }),
      StudyMaterial.countDocuments({ type: "voice_explanation" }),
      StudyMaterial.countDocuments({ type: "flashcards" }),
      StudyMaterial.countDocuments({ type: "viva_questions" }),
    ]);

    const subjectUsage = await LectureDocument.aggregate([
      { $match: { status: "ready" } },
      {
        $group: {
          _id: { $ifNull: ["$module", "General"] },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    res.json({
      success: true,
      data: {
        users: { students: totalStudents, lecturers: totalLecturers },
        documents: totalDocuments,
        generated: {
          cheatSheets,
          voiceExplanations,
          flashcardSets,
          vivaSessions,
        },
        subjectUsage,
      },
    });
  } catch (e) {
    next(e);
  }
});

router.get("/users", async (_req, res, next) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });
    res.json({ success: true, data: users });
  } catch (e) {
    next(e);
  }
});

router.patch("/users/:id/block", async (req: AuthRequest, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    ).select("-password");
    if (!user) throw new AppError("User not found", 404);
    res.json({ success: true, data: user });
  } catch (e) {
    next(e);
  }
});

router.get("/documents", async (_req, res, next) => {
  try {
    const docs = await LectureDocument.find()
      .sort({ createdAt: -1 })
      .populate("uploadedBy", "name email role");
    res.json({ success: true, data: docs });
  } catch (e) {
    next(e);
  }
});

router.get("/materials", async (_req, res, next) => {
  try {
    const materials = await StudyMaterial.find()
      .sort({ createdAt: -1 })
      .limit(100)
      .populate("userId", "name email")
      .populate("documentId", "title");
    res.json({ success: true, data: materials });
  } catch (e) {
    next(e);
  }
});

export default router;
