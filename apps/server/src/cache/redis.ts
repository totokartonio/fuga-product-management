import { createClient } from "redis";
import { env } from "../config/env";

export const redis = createClient({
  url: env.REDIS_URL,
  socket: {
    reconnectStrategy: (retries) => Math.min(retries * 200, 5000),
    connectTimeout: 2000,
  },
  disableOfflineQueue: true,
});

let loggedDown = false;

redis.on("error", (err) => {
  if (!loggedDown) {
    console.error("Redis unavailable, serving from Postgres:", err.message);
    loggedDown = true;
  }
});

redis.on("ready", () => {
  if (loggedDown) console.log("Redis reconnected");
  loggedDown = false;
});

export const connectRedis = async () => {
  try {
    await redis.connect();
  } catch (err) {
    console.error("Redis initial connect failed:", (err as Error).message);
  }
};
