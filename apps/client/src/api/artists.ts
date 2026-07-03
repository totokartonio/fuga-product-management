import type { ArtistResponse } from "@fuga/shared";
import { API_BASE } from "./config";
import { throwApiError } from "./apiError";

export const getArtists = async (
  search?: string,
): Promise<ArtistResponse[]> => {
  const url = search
    ? `${API_BASE}/artists?search=${encodeURIComponent(search)}`
    : `${API_BASE}/artists`;
  const res = await fetch(url);
  if (!res.ok) await throwApiError(res);
  return res.json();
};

export const createArtist = async (input: {
  name: string;
}): Promise<ArtistResponse> => {
  const res = await fetch(`${API_BASE}/artists`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) await throwApiError(res);
  return res.json();
};
