import multer from "multer";
import { MAX_COVER_SIZE } from "@fuga/shared";

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_COVER_SIZE },
});
