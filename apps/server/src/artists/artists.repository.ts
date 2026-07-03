import { prisma } from "../db/client";
import { mapToArtistResponse } from "./artists.mapper";
import { normalizeSearch } from "../utils/normalizeSearch";
import { cacheAside, invalidateByPrefix } from "../cache/cache";

const ARTISTS_SEARCH_PREFIX = "artists:search:";
const ARTISTS_SEARCH_TTL = 60;

export const listArtists = async (search?: string) => {
  const q = search ? normalizeSearch(search) : "";
  const key = `${ARTISTS_SEARCH_PREFIX}${q}`;
  return cacheAside(key, ARTISTS_SEARCH_TTL, async () => {
    const artists = await prisma.artist.findMany({
      where: q ? { name: { contains: q, mode: "insensitive" } } : undefined,
      orderBy: { name: "asc" },
    });
    return artists.map(mapToArtistResponse);
  });
};

export const createArtist = async (input: { name: string }) => {
  const artist = await prisma.artist.create({ data: { name: input.name } });
  await invalidateByPrefix(ARTISTS_SEARCH_PREFIX);
  return mapToArtistResponse(artist);
};
