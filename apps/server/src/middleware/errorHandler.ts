import { MulterError } from "multer";
import type { Request, Response, NextFunction } from "express";

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof MulterError && err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({
      error: {
        code: "FILE_TOO_LARGE",
        message: "File exceeds 5MB",
        fields: {},
      },
    });
  }
  console.error("Unhandled error:", err);
  res
    .status(500)
    .json({ error: { code: "INTERNAL", message: "Server error", fields: {} } });
};
