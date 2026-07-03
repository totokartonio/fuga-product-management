import "dotenv/config";
import { env } from "./config/env";
import { app } from "./app";
import { ensureBucket } from "./storage/minio.provider";
import { connectRedis } from "./cache/redis";

await ensureBucket();
await connectRedis();

app.listen(env.PORT, () => {
  console.log(`server listening on :${env.PORT}`);
});
