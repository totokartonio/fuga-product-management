import { z } from "zod";

export const createArtistSchema = z.object({
  name: z.string().trim().min(1).max(100),
});
export type CreateArtistInput = z.infer<typeof createArtistSchema>;

export const artistResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
});
export type ArtistResponse = z.infer<typeof artistResponseSchema>;
