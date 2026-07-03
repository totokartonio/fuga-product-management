import { fileTypeFromBuffer } from "file-type";
import sharp from "sharp";
import { randomUUID } from "node:crypto";
import { minioStorage } from "../storage/minio.provider";
import { ALLOWED_COVER_TYPES } from "@fuga/shared";

export class UnsupportedMediaTypeError extends Error {}

export const processAndStoreCover = async (buffer: Buffer): Promise<string> => {
  // magic-byte check
  const detected = await fileTypeFromBuffer(buffer);
  if (
    !detected ||
    !(ALLOWED_COVER_TYPES as readonly string[]).includes(detected.mime)
  ) {
    throw new UnsupportedMediaTypeError("Unsupported image type");
  }

  // sharp: normalize and thumbnail
  const processed = await sharp(buffer)
    .resize(500, 500, { fit: "cover" })
    .webp({ quality: 80 })
    .toBuffer();

  // store under a unique key
  const key = `${randomUUID()}.webp`;
  await minioStorage.save(key, processed, "image/webp");

  return key; // coverArtKey
};
