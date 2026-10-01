// Switches the database from SQLite (local file) to Postgres (e.g. Supabase or Neon).
// Usage:
//   1. Put your Postgres connection string in DATABASE_URL (in .env.local and on Vercel).
//   2. npm run db:use-postgres
//   3. npx prisma db push      (creates the tables in your Postgres database)
// The app adds the demo school data by itself the first time it runs.
import { readFileSync, writeFileSync } from "node:fs";

const path = "prisma/schema.prisma";
const schema = readFileSync(path, "utf8");
if (schema.includes('provider = "postgresql"')) {
  console.log("Already using Postgres.");
} else {
  writeFileSync(path, schema.replace('provider = "sqlite"', 'provider = "postgresql"'));
  console.log("Switched prisma/schema.prisma to Postgres. Next: npx prisma db push");
}
