import path from "node:path";

import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

import { env } from "@/lib/env";

const client = postgres(env.DATABASE_URL, { max: 1 });

await migrate(drizzle(client), {
  migrationsFolder: path.join(process.cwd(), "src", "db", "migrations"),
});

await client.end();
console.log("Migrations applied");
