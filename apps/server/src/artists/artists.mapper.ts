import type { ArtistResponse } from "@fuga/shared";

export const mapToArtistResponse = (artist: {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}): ArtistResponse => {
  return {
    id: artist.id,
    name: artist.name,
  };
};
