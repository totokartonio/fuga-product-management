import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../app";
import { prisma } from "../db/client";

describe("POST /api/products", () => {
  it("creates a product with a primary artist", async () => {
    // an artist to reference
    const artist = await prisma.artist.create({ data: { name: "Pixies" } });

    const res = await request(app)
      .post("/api/products")
      .field("name", "Surfer Rosa")
      .field("mainArtistId", artist.id);

    expect(res.status).toBe(201);
    expect(res.body.name).toBe("Surfer Rosa");
    expect(res.body.artists).toHaveLength(1);
    expect(res.body.artists[0]).toMatchObject({
      id: artist.id,
      role: "PRIMARY",
      position: 0,
    });

    const inDb = await prisma.product.findUnique({
      where: { id: res.body.id },
      include: { artists: true },
    });
    expect(inDb).not.toBeNull();
    expect(inDb!.artists).toHaveLength(1);
    expect(inDb!.artists[0].artistId).toBe(artist.id);
  });

  it("creates a product with featured artists in position order", async () => {
    const main = await prisma.artist.create({
      data: { name: "The Velvet Underground" },
    });
    const feat1 = await prisma.artist.create({ data: { name: "Nico" } });
    const feat2 = await prisma.artist.create({ data: { name: "The Stooges" } });

    const res = await request(app)
      .post("/api/products")
      .field("name", "Some Album")
      .field("mainArtistId", main.id)
      .field("featuredArtistIds", feat1.id)
      .field("featuredArtistIds", feat2.id);

    expect(res.status).toBe(201);
    expect(res.body.artists).toHaveLength(3);
    // primary at 0, featured at 1 and 2 in submission order
    expect(res.body.artists).toMatchObject([
      { id: main.id, role: "PRIMARY", position: 0 },
      { id: feat1.id, role: "FEATURED", position: 1 },
      { id: feat2.id, role: "FEATURED", position: 2 },
    ]);
  });

  it("rejects missing name with 400", async () => {
    const artist = await prisma.artist.create({ data: { name: "Revolver" } });
    const res = await request(app)
      .post("/api/products")
      .field("mainArtistId", artist.id);

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.fields).toHaveProperty("name");
  });

  it("rejects missing mainArtistId with 400", async () => {
    const res = await request(app)
      .post("/api/products")
      .field("name", "No Artist");

    expect(res.status).toBe(400);
    expect(res.body.error.fields).toHaveProperty("mainArtistId");
  });

  it("rejects an artist as both main and featured with 400", async () => {
    const artist = await prisma.artist.create({ data: { name: "Oasis" } });
    const res = await request(app)
      .post("/api/products")
      .field("name", "(What's the Story) Morning Glory?")
      .field("mainArtistId", artist.id)
      .field("featuredArtistIds", artist.id);

    expect(res.status).toBe(400);
    expect(res.body.error.fields).toHaveProperty("featuredArtistIds");
  });

  it("rejects an unsupported cover type with 415", async () => {
    const artist = await prisma.artist.create({ data: { name: "Rancid" } });
    const res = await request(app)
      .post("/api/products")
      .field("name", "Let's Go")
      .field("mainArtistId", artist.id)
      .attach("cover", Buffer.from("not an image"), "fake.jpg");

    expect(res.status).toBe(415);
    expect(res.body.error.code).toBe("UNSUPPORTED_MEDIA_TYPE");
  });
});

describe("GET /api/products", () => {
  it("returns an empty list initially", async () => {
    const res = await request(app).get("/api/products");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("returns created products", async () => {
    const artist = await prisma.artist.create({ data: { name: "Pixies" } });
    await request(app)
      .post("/api/products")
      .field("name", "Doolittle")
      .field("mainArtistId", artist.id);

    const res = await request(app).get("/api/products");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe("Doolittle");
  });
});

describe("DELETE /api/products/:id", () => {
  it("deletes a product and cascades join rows", async () => {
    const artist = await prisma.artist.create({
      data: { name: "The Strokes" },
    });
    const created = await request(app)
      .post("/api/products")
      .field("name", "The New Abnormal")
      .field("mainArtistId", artist.id);

    const del = await request(app).delete(`/api/products/${created.body.id}`);
    expect(del.status).toBe(204);

    // product gone, join rows cascaded, artist persists
    expect(
      await prisma.product.findUnique({ where: { id: created.body.id } }),
    ).toBeNull();
    expect(await prisma.productArtist.count()).toBe(0);
    expect(
      await prisma.artist.findUnique({ where: { id: artist.id } }),
    ).not.toBeNull();
  });

  it("rejects two main artists (repeated mainArtistId) with 400", async () => {
    const a = await prisma.artist.create({ data: { name: "First" } });
    const b = await prisma.artist.create({ data: { name: "Second" } });

    const res = await request(app)
      .post("/api/products")
      .field("name", "Two Mains")
      .field("mainArtistId", a.id)
      .field("mainArtistId", b.id);

    expect(res.status).toBe(400);
    expect(res.body.error.fields).toHaveProperty("mainArtistId");
  });
});
