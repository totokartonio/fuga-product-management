export const normalizeIds = (artistIds: unknown): string[] => {
  if (Array.isArray(artistIds)) return artistIds;
  if (typeof artistIds === "string") return [artistIds];
  return [];
};
