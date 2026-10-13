import { createMiddleware } from "hono/factory";

export type AppEnv = { Variables: { requestId: string } };

export const requestIdMiddleware = createMiddleware<AppEnv>(async (c, next) => {
  const existing = c.req.header("x-request-id");
  const requestId = existing ?? crypto.randomUUID();
  c.set("requestId", requestId);
  c.header("x-request-id", requestId);
  await next();
});
