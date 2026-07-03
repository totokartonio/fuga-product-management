import { z } from "zod";

export const ARTIST_ROLES = ["PRIMARY", "FEATURED"] as const;
export const artistRoleSchema = z.enum(ARTIST_ROLES);
export type ArtistRole = z.infer<typeof artistRoleSchema>;
