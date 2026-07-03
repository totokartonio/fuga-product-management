import { Router } from "express";
import { minioStorage } from "../storage/minio.provider";

export const coversRouter = Router();

const coverKeyPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.webp$/i;

coversRouter.get("/:key", async (req, res, next) => {
  const key = req.params.key;

  if (!coverKeyPattern.test(key)) {
    return res.status(404).json({
      error: { code: "NOT_FOUND", message: "Cover not found", fields: {} },
    });
  }

  try {
    const objectStream = await minioStorage.read(key);

    res.setHeader("Content-Type", "image/webp");
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");

    objectStream.on("error", next);
    objectStream.pipe(res);
  } catch (err) {
    const code = (err as { code?: string }).code;

    if (code === "NoSuchKey" || code === "NotFound") {
      return res.status(404).json({
        error: { code: "NOT_FOUND", message: "Cover not found", fields: {} },
      });
    }

    next(err);
  }
});
