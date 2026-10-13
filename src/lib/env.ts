import { z } from "zod";

// Every required environment variable is declared and validated here so that a
// missing or malformed value fails fast at startup instead of surfacing later as
// an obscure runtime error deep inside a provider client.
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.url(),
  REDIS_URL: z.url(),
  SUPABASE_URL: z.url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  UPLOAD_BUCKET: z.string().min(1).default("resourcebox"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  throw new Error(`Invalid environment configuration:\n${JSON.stringify(parsed.error.issues, null, 2)}`);
}

/**
 * The parsed, validated environment. Read this typed singleton instead of
 * touching `process.env` directly anywhere in the application.
 */
export const env = parsed.data;
