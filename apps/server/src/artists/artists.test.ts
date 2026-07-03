import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../app";
import { prisma } from "../db/client";

describe("POST /api/artists", () => {
  it("creates an artist", async () => {
    const res = await request(app)
      .post("/api/artists")
      .send({ name: "The Cure" });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe("The Cure");
    expect(
      await prisma.artist.findUnique({ where: { id: res.body.id } }),
    ).not.toBeNull();
  });

  it("rejects an empty name with 400", async () => {
    const res = await request(app).post("/api/artists").send({ name: "" });
    expect(res.status).toBe(400);
  });
});

describe("GET /api/artists", () => {
  it("filters by search, case-insensitively", async () => {
    await prisma.artist.create({ data: { name: "Radiohead" } });
    await prisma.artist.create({ data: { name: "Portishead" } });
    await prisma.artist.create({ data: { name: "Blur" } });

    const res = await request(app).get("/api/artists?search=head");
    expect(res.status).toBe(200);
    expect(res.body.map((a: { name: string }) => a.name).sort()).toEqual([
      "Portishead",
      "Radiohead",
    ]);
  });

  it("returns 409 when artist already exists", async () => {
    await prisma.artist.create({ data: { name: "The Cure" } });

    const res = await request(app)
      .post("/api/artists")
      .send({ name: "The Cure" });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("ARTIST_ALREADY_EXISTS");
    expect(res.body.error.message).toBe("This artist already exists");
    expect(res.body.error.fields.name).toBe("This artist already exists");
  });
});
