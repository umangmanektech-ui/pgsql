import { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error("Unhandled Error:", err);

  // Prisma Known Request Errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // P2025: Record to update/delete not found
    if (err.code === "P2025") {
      return res.status(404).json({
        error: "Record not found",
        code: err.code,
        detail: (err.meta?.cause as string) || err.message,
      });
    }

    // P2002: Unique constraint failed
    if (err.code === "P2002") {
      return res.status(409).json({
        error: "Unique constraint violation",
        code: err.code,
        target: err.meta?.target,
      });
    }

    // P2003: Foreign key constraint failed
    if (err.code === "P2003") {
      return res.status(400).json({
        error: "Foreign key constraint failed",
        code: err.code,
        field: err.meta?.field_name,
      });
    }

    return res.status(400).json({
      error: "Database request error",
      code: err.code,
      message: err.message,
    });
  }

  // Prisma Initialization Errors (e.g. invalid connection URL, server down)
  if (err instanceof Prisma.PrismaClientInitializationError) {
    return res.status(503).json({
      error: "Database connection failed",
      detail: "Check your DATABASE_URL in .env",
      message: err.message,
    });
  }

  // Standard Error objects
  if (err instanceof Error) {
    return res.status(500).json({
      error: err.message || "Internal Server Error",
    });
  }

  // Fallback
  return res.status(500).json({
    error: "An unexpected error occurred",
  });
}
