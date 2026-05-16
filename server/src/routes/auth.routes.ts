import { Router, Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";
import { User } from "../models/User";
import { env } from "../config/env";
import { authenticate, loadUser, AuthRequest } from "../middleware/auth";
import { AppError } from "../middleware/errorHandler";

const router = Router();

function signToken(userId: string, email: string, role: string): string {
  return jwt.sign(
    { userId, email, role },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn as jwt.SignOptions["expiresIn"] }
  );
}

router.post(
  "/register",
  [
    body("name").trim().notEmpty(),
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 6 }),
    body("role").optional().isIn(["student", "lecturer"]),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError(errors.array()[0].msg, 400);
      }

      const { name, email, password, university, course, preferredLanguage, role } =
        req.body;

      const existing = await User.findOne({ email });
      if (existing) throw new AppError("Email already registered", 409);

      const hashed = await bcrypt.hash(password, 12);
      const user = await User.create({
        name,
        email,
        password: hashed,
        university,
        course,
        preferredLanguage: preferredLanguage || "english",
        role: role || "student",
      });

      const token = signToken(user._id.toString(), user.email, user.role);

      res.status(201).json({
        success: true,
        data: {
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            university: user.university,
            course: user.course,
            preferredLanguage: user.preferredLanguage,
          },
        },
      });
    } catch (e) {
      next(e);
    }
  }
);

router.post(
  "/login",
  [body("email").isEmail(), body("password").notEmpty()],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError("Invalid credentials", 400);
      }

      const { email, password } = req.body;
      const user = await User.findOne({ email }).select("+password");
      if (!user || !user.isActive) {
        throw new AppError("Invalid email or password", 401);
      }

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) throw new AppError("Invalid email or password", 401);

      const token = signToken(user._id.toString(), user.email, user.role);

      res.json({
        success: true,
        data: {
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            university: user.university,
            course: user.course,
            preferredLanguage: user.preferredLanguage,
          },
        },
      });
    } catch (e) {
      next(e);
    }
  }
);

router.get("/me", authenticate, loadUser, (req: AuthRequest, res: Response) => {
  const u = req.user!;
  res.json({
    success: true,
    data: {
      id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      university: u.university,
      course: u.course,
      preferredLanguage: u.preferredLanguage,
      examTitle: u.examTitle,
      examDate: u.examDate,
    },
  });
});

router.post("/logout", authenticate, (_req, res) => {
  res.json({ success: true, message: "Logged out successfully" });
});

export default router;
