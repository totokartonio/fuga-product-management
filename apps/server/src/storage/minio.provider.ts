import { Client } from "minio";
import { env } from "../config/env";
import type { StorageProvider } from "./storage.provider";
import { withRetry } from "../utils/withRetry";

const client = new Client({
  endPoint: env.MINIO_ENDPOINT,
  port: env.MINIO_PORT,
  useSSL: env.MINIO_USE_SSL,
  accessKey: env.MINIO_ACCESS_KEY,
  secretKey: env.MINIO_SECRET_KEY,
});

const bucket = env.MINIO_BUCKET;

export const ensureBucket = async (): Promise<void> => {
  const exists = await client.bucketExists(bucket);
  if (!exists) {
    await client.makeBucket(bucket);
  }

  const policy = {
    Version: "2012-10-17",
    Statement: [
      {
        Effect: "Allow",
        Principal: { AWS: ["*"] },
        Action: ["s3:GetObject"],
        Resource: [`arn:aws:s3:::${bucket}/*`],
      },
    ],
  };
  await client.setBucketPolicy(bucket, JSON.stringify(policy));
};

export const minioStorage: StorageProvider = {
  save: async (key, body, contentType) => {
    await withRetry(() =>
      client.putObject(bucket, key, body, body.length, {
        "Content-Type": contentType,
      }),
    );
  },
  delete: async (key) => {
    await withRetry(() => client.removeObject(bucket, key));
  },
  getUrl: (key) => {
    const protocol = env.MINIO_USE_SSL ? "https" : "http";
    const host = env.MINIO_PUBLIC_ENDPOINT ?? env.MINIO_ENDPOINT;
    return `${protocol}://${host}:${env.MINIO_PORT}/${bucket}/${key}`;
  },
};
