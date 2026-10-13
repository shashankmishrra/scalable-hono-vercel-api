import { Hono } from "hono";

import { resourceRouter } from "@/features/resources/resource.router";
import { env } from "@/lib/env";

import { errorHandler } from "./middleware/error-handler";
import { requestIdMiddleware, type AppEnv } from "./middleware/request-id";

export const app = new Hono<AppEnv>().basePath("/api");

app.use("*", requestIdMiddleware);
app.onError(errorHandler);
app.notFound((c) =>
  c.json({ error: { code: "NOT_FOUND", message: "Route not found", requestId: c.get("requestId") } }, 404),
);

app.get("/health", (c) => c.json({ status: "ok", environment: env.NODE_ENV }));

app.route("/resources", resourceRouter);
