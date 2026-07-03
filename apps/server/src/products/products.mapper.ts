import type { ProductResponse } from "@fuga/shared";
import type { ArtistRole } from "@fuga/shared";
import { minioStorage } from "../storage/minio.provider";

export const mapToProductResponse = (product: {
  id: string;
  name: string;
  coverArtKey: string | null;
  createdAt: Date;
  updatedAt: Date;
  artists: {
    role: string;
    position: number;
    artist: { id: string; name: string };
  }[];
}): ProductResponse => {
  return {
    id: product.id,
    name: product.name,
    coverArtUrl: product.coverArtKey
      ? minioStorage.getUrl(product.coverArtKey)
      : null,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
    artists: product.artists.map((pa) => ({
      id: pa.artist.id,
      name: pa.artist.name,
      role: pa.role as ArtistRole,
      position: pa.position,
    })),
  };
};
