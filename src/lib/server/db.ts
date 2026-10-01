import "server-only";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { INIT_SQL } from "./db-init-sql";
import { seedDemoData } from "./seed";

// Where the database lives:
//  - DATABASE_URL if set (SQLite "file:..." or Postgres "postgresql://...")
//  - on Vercel without a database: a temporary SQLite file in /tmp (resets sometimes — fine for a demo)
//  - on your computer: prisma/dev.db
function databaseUrl(): string {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  if (process.env.VERCEL) return "file:/tmp/rumbo.db";
  return `file:${path.join(process.cwd(), "prisma", "dev.db")}`;
}

const url = databaseUrl();
const isSqlite = url.startsWith("file:");

const g = globalThis as unknown as { __prisma?: PrismaClient; __dbReady?: Promise<void> };
const prisma = g.__prisma ?? new PrismaClient({ datasourceUrl: url });
if (process.env.NODE_ENV !== "production") g.__prisma = prisma;

async function init() {
  if (isSqlite) {
    // Create any missing tables (safe to run every time the server starts).
    for (const stmt of INIT_SQL) await prisma.$executeRawUnsafe(stmt);
  }
  await seedDemoData(prisma);
}

/** Get the database, creating tables and demo data the first time. */
export async function getDb(): Promise<PrismaClient> {
  if (!g.__dbReady) {
    g.__dbReady = init().catch((e) => {
      g.__dbReady = undefined;
      throw e;
    });
  }
  await g.__dbReady;
  return prisma;
}
