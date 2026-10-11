import { Hono } from "hono";
import { env } from "@/lib/env";

export const app = new Hono().basePath("/api");

app.get("/health", (c) => {
  return c.json({ status: "ok", environment: env.NODE_ENV });
});
