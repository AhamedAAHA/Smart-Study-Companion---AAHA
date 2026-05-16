import { Request, Response, NextFunction } from "express";
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
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const status =
    err instanceof AppError ? err.statusCode : 500;
  const message =
    err instanceof AppError || !env.isProduction
      ? err.message
      : "Internal server error";

  if (status >= 500) {
    console.error(err);
  }

  res.status(status).json({ success: false, message });
}
