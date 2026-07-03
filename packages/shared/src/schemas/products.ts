import { z } from "zod";
import { artistRoleSchema } from "./artistRole";

const featuredAreUnique = (ids: string[] | undefined) =>
  !ids || new Set(ids).size === ids.length;

export const createProductSchema = z
  .object({
    name: z.string().trim().min(1, "Enter a product name").max(100),
    mainArtistId: z.string().min(1, "Select a main artist"),
    featuredArtistIds: z.array(z.string()).default([]),
  })
  .refine((d) => !d.featuredArtistIds.includes(d.mainArtistId), {
    message: "An artist can't be both main and featured",
    path: ["featuredArtistIds"],
  })
  .refine((d) => featuredAreUnique(d.featuredArtistIds), {
    message: "Duplicate featured artist",
    path: ["featuredArtistIds"],
  });
export type CreateProductInput = z.infer<typeof createProductSchema>;

export const updateProductSchema = z
  .object({
    name: z.string().trim().min(1).max(100).optional(),
    mainArtistId: z.string().min(1).optional(),
    featuredArtistIds: z.array(z.string()).optional(),
    removeCover: z.boolean().optional(),
  })
  // excludes-main omitted here: a PATCH may change featured without
  // resending the unchanged main artist, so the rule can't run on payload alone
  .refine((d) => featuredAreUnique(d.featuredArtistIds), {
    message: "Duplicate featured artist",
    path: ["featuredArtistIds"],
  });
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

export const productArtistSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: artistRoleSchema,
  position: z.number().int(),
});

export const productResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  coverArtUrl: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  artists: z.array(productArtistSchema),
});

export type ProductResponse = z.infer<typeof productResponseSchema>;
