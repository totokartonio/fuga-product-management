import { prisma } from "../db/client";
import type { CreateProductInput, UpdateProductInput } from "@fuga/shared";
import { mapToProductResponse } from "./products.mapper";
import { minioStorage } from "../storage/minio.provider";
import { cacheAside, invalidate } from "../cache/cache";

const PRODUCTS_LIST_KEY = "products:list";
const PRODUCTS_LIST_TTL = 300;

export const listProducts = async () => {
  return cacheAside(PRODUCTS_LIST_KEY, PRODUCTS_LIST_TTL, async () => {
    const products = await prisma.product.findMany({
      include: {
        artists: {
          include: { artist: true },
          orderBy: { position: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return products.map(mapToProductResponse);
  });
};

export const createProduct = async (
  input: CreateProductInput,
  coverArtKey: string | null,
) => {
  const product = await prisma.product.create({
    data: {
      name: input.name,
      coverArtKey,
      artists: {
        create: [
          { artistId: input.mainArtistId, role: "PRIMARY", position: 0 },
          ...input.featuredArtistIds.map((id, i) => ({
            artistId: id,
            role: "FEATURED" as const,
            position: i + 1,
          })),
        ],
      },
    },
    include: {
      artists: { include: { artist: true }, orderBy: { position: "asc" } },
    },
  });

  await invalidate(PRODUCTS_LIST_KEY);
  return mapToProductResponse(product);
};

export const deleteProduct = async (id: string) => {
  const product = await prisma.product.findUnique({ where: { id } });
  await prisma.product.delete({ where: { id } });
  if (product?.coverArtKey) {
    await minioStorage
      .delete(product.coverArtKey)
      .catch((e) =>
        console.error("Failed to delete cover on product delete:", e),
      );
  }

  await invalidate(PRODUCTS_LIST_KEY);
};

export const updateProduct = async (
  id: string,
  input: UpdateProductInput,
  newCoverKey: string | null,
) => {
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) return null;

  let coverArtKey = existing.coverArtKey; // default: unchanged
  let keyToDelete: string | null = null;
  if (newCoverKey) {
    keyToDelete = existing.coverArtKey; // replace: delete old
    coverArtKey = newCoverKey;
  } else if (input.removeCover) {
    keyToDelete = existing.coverArtKey; // clear: delete old
    coverArtKey = null;
  }

  // rebuild artist join rows only if mainArtistId provided
  const artistsUpdate = input.mainArtistId
    ? {
        deleteMany: {},
        create: [
          {
            artistId: input.mainArtistId,
            role: "PRIMARY" as const,
            position: 0,
          },
          ...(input.featuredArtistIds ?? []).map((aid, i) => ({
            artistId: aid,
            role: "FEATURED" as const,
            position: i + 1,
          })),
        ],
      }
    : undefined;

  const product = await prisma.product.update({
    where: { id },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      coverArtKey,
      ...(artistsUpdate && { artists: artistsUpdate }),
    },
    include: {
      artists: { include: { artist: true }, orderBy: { position: "asc" } },
    },
  });

  // delete old object after the DB write succeeds
  if (keyToDelete) {
    await minioStorage
      .delete(keyToDelete)
      .catch((e) => console.error("Failed to delete replaced cover:", e));
  }

  await invalidate(PRODUCTS_LIST_KEY);
  return mapToProductResponse(product);
};
