import express from "express";
import cors from "cors";
import { productsRouter } from "./products/products.routes";
import { artistsRouter } from "./artists/artists.routes";
import { errorHandler } from "./middleware/errorHandler";

export const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});
app.use("/api/products", productsRouter);
app.use("/api/artists", artistsRouter);

app.use(errorHandler);
