import "dotenv/config";
import { config } from "dotenv";
import { beforeEach, afterAll } from "vitest";

config({ path: ".env.test", override: true });

const { prisma } = await import("../db/client");

beforeEach(async () => {
  await prisma.productArtist.deleteMany();
  await prisma.product.deleteMany();
  await prisma.artist.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});
