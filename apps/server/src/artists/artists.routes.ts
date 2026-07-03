import { Router } from "express";
import { listArtists, createArtist } from "./artists.repository";
import { createArtistSchema, fieldErrorsFromZod } from "@fuga/shared";

export const artistsRouter = Router();

artistsRouter.get("/", async (req, res) => {
  const search =
    typeof req.query.search === "string" ? req.query.search : undefined;
  res.json(await listArtists(search));
});

artistsRouter.post("/", async (req, res) => {
  const parsed = createArtistSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid artist",
        fields: fieldErrorsFromZod(parsed.error),
      },
    });
    return;
  }
  const artist = await createArtist(parsed.data);
  res.status(201).json(artist);
});
