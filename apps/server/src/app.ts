import express from "express";
import cors from "cors";
import { productsRouter } from "./products/products.routes";
import { artistsRouter } from "./artists/artists.routes";
import { errorHandler } from "./middleware/errorHandler";
import swaggerUi from "swagger-ui-express";
import { openApiDocument } from "./openapi/openapi";
import { coversRouter } from "./covers/covers.routes";

export const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", build: "DEPLOY_BRANCH_MINIO_FIX_2026_07_03" });
});
app.use("/api/products", productsRouter);
app.use("/api/artists", artistsRouter);
app.use("/api/covers", coversRouter);

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));
app.get("/api/openapi.json", (_req, res) => res.json(openApiDocument));

app.use(errorHandler);
