import type { ProductResponse } from "@fuga/shared";

export const formatCredits = (artists: ProductResponse["artists"]) => {
  const ordered = [...artists].sort((a, b) => a.position - b.position);
  const main = ordered.find((a) => a.role === "PRIMARY");
  const featured = ordered.filter((a) => a.role === "FEATURED");
  return { main: main?.name ?? "", featured: featured.map((a) => a.name) };
};
