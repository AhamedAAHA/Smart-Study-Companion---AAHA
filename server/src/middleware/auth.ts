import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { User, IUser, UserRole } from "../models/User";

export interface AuthPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface AuthRequest extends Request {
  user?: IUser;
  auth?: AuthPayload;
}

export function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ success: false, message: "Authentication required" });
    return;
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, env.jwtSecret) as AuthPayload;
    req.auth = payload;
    next();
  } catch {
    res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
}

export async function loadUser(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (!req.auth?.userId) {
    res.status(401).json({ success: false, message: "Authentication required" });
    return;
  }

  const user = await User.findById(req.auth.userId);
  if (!user || !user.isActive) {
    res.status(401).json({ success: false, message: "User not found or inactive" });
    return;
  }
  req.user = user;
  next();
}

export function authorize(...roles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.auth || !roles.includes(req.auth.role)) {
      res.status(403).json({ success: false, message: "Access denied" });
      return;
    }
    next();
  };
}
