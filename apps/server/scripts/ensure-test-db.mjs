import { Client } from "pg";
import fs from "node:fs";
import path from "node:path";

const envPath = path.resolve(".env.test");

const envFile = fs.existsSync(envPath)
  ? Object.fromEntries(
      fs
        .readFileSync(envPath, "utf8")
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith("#"))
        .map((line) => {
          const index = line.indexOf("=");
          return [line.slice(0, index), line.slice(index + 1)];
        }),
    )
  : {};

const databaseUrl = process.env.DATABASE_URL ?? envFile.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set");
}

const targetUrl = new URL(databaseUrl);
const targetDb = targetUrl.pathname.slice(1);

if (!targetDb) {
  throw new Error("DATABASE_URL must include a database name");
}

const adminUrl = new URL(databaseUrl);
adminUrl.pathname = "/postgres";

const client = new Client({
  connectionString: adminUrl.toString(),
});

await client.connect();

const result = await client.query(
  "SELECT 1 FROM pg_database WHERE datname = $1",
  [targetDb],
);

if (result.rowCount === 0) {
  const safeDbName = targetDb.replaceAll('"', '""');
  await client.query(`CREATE DATABASE "${safeDbName}"`);
  console.log(`Created test database: ${targetDb}`);
} else {
  console.log(`Test database already exists: ${targetDb}`);
}

await client.end();
