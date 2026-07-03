import type { ArtistRole as PrismaArtistRole } from "../generated/prisma/client";
import type { ArtistRole as SharedArtistRole } from "@fuga/shared";

type AssertEqual<A, B> = [A] extends [B]
  ? [B] extends [A]
    ? true
    : never
  : never;
const _exhaustive: AssertEqual<PrismaArtistRole, SharedArtistRole> = true;
void _exhaustive;
