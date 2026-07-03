import { Router } from "express";
import { upload } from "./products.upload";
import {
  listProducts,
  createProduct,
  deleteProduct,
  updateProduct,
} from "./products.repository";
import {
  createProductSchema,
  fieldErrorsFromZod,
  updateProductSchema,
} from "@fuga/shared";
import {
  processAndStoreCover,
  UnsupportedMediaTypeError,
} from "./products.cover";
import { minioStorage } from "../storage/minio.provider";
import { normalizeIds } from "../utils/normalizeIds";

export const productsRouter = Router();

productsRouter.get("/", async (_req, res) => {
  const products = await listProducts();
  res.json(products);
});

productsRouter.post("/", upload.single("cover"), async (req, res) => {
  const parsed = createProductSchema.safeParse({
    name: req.body.name,
    mainArtistId: req.body.mainArtistId,
    featuredArtistIds: normalizeIds(req.body.featuredArtistIds),
  });
  if (!parsed.success) {
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid product",
        fields: fieldErrorsFromZod(parsed.error),
      },
    });
  }

  // if a cover was uploaded
  let coverArtKey: string | null = null;
  if (req.file) {
    try {
      coverArtKey = await processAndStoreCover(req.file.buffer);
    } catch (err) {
      if (err instanceof UnsupportedMediaTypeError) {
        return res.status(415).json({
          error: {
            code: "UNSUPPORTED_MEDIA_TYPE",
            message: "Unsupported image type",
            fields: {},
          },
        });
      }
      throw err;
    }
  }

  try {
    const product = await createProduct(parsed.data, coverArtKey);
    return res.status(201).json(product);
  } catch (err) {
    // delete the orphan if object was uploaded but DB failed
    if (coverArtKey) {
      await minioStorage.delete(coverArtKey).catch((e) => {
        console.error("Failed to delete orphaned cover:", coverArtKey, e);
      });
    }
    throw err;
  }
});

productsRouter.patch("/:id", upload.single("cover"), async (req, res) => {
  const parsed = updateProductSchema.safeParse({
    name: req.body.name,
    mainArtistId: req.body.mainArtistId,
    featuredArtistIds: req.body.featuredArtistIds
      ? normalizeIds(req.body.featuredArtistIds)
      : undefined,
    removeCover: req.body.removeCover === "true",
  });
  if (!parsed.success) {
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid product update",
        fields: fieldErrorsFromZod(parsed.error),
      },
    });
  }

  // process a new cover file if present
  let newCoverKey: string | null = null;
  if (req.file) {
    try {
      newCoverKey = await processAndStoreCover(req.file.buffer);
    } catch (err) {
      if (err instanceof UnsupportedMediaTypeError) {
        return res.status(415).json({
          error: {
            code: "UNSUPPORTED_MEDIA_TYPE",
            message: "Unsupported image type",
            fields: {},
          },
        });
      }
      throw err;
    }
  }

  try {
    const id = String(req.params.id);
    const product = await updateProduct(id, parsed.data, newCoverKey);
    if (!product) {
      // compensate the just-uploaded cover
      if (newCoverKey) await minioStorage.delete(newCoverKey).catch(() => {});
      return res.status(404).json({
        error: { code: "NOT_FOUND", message: "Product not found", fields: {} },
      });
    }
    return res.status(200).json(product);
  } catch (err) {
    if (newCoverKey) await minioStorage.delete(newCoverKey).catch(() => {});
    throw err;
  }
});

productsRouter.delete("/:id", async (req, res) => {
  try {
    await deleteProduct(req.params.id);
    res.status(204).send();
  } catch {
    res.status(404).json({
      error: { code: "NOT_FOUND", message: "Product not found", fields: {} },
    });
  }
});
