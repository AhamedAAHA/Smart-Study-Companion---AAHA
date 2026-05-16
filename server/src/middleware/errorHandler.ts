import { Request, Response, NextFunction } from "express";
import { applyCorsHeaders } from "../config/cors";
import { env } from "../config/env";

export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const multerMessage =
    err.message === "Only PDF and PowerPoint files are allowed" ||
    err.message.includes("File too large")
      ? err.message
      : null;

  const validationMessage =
    err.name === "ValidationError"
      ? Object.values(
          (err as { errors?: Record<string, { message?: string }> }).errors ||
            {}
        )[0]?.message
      : null;

  const status = err instanceof AppError
    ? err.statusCode
    : multerMessage || validationMessage
      ? 400
      : 500;
  const message =
    err instanceof AppError ||
    multerMessage ||
    validationMessage ||
    !env.isProduction
      ? multerMessage || validationMessage || err.message
      : "Internal server error";

  if (status >= 500) {
    console.error(err);
  }

  applyCorsHeaders(req.headers.origin, (name, value) =>
    res.setHeader(name, value)
  );
  res.status(status).json({ success: false, message });
}
