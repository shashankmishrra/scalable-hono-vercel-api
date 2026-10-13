import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";

import { AppError } from "@/lib/errors/app-error";

import type { AppEnv } from "./request-id";

export function errorHandler(err: Error, c: Context<AppEnv>): Response {
  const requestId = c.get("requestId");

  if (err instanceof AppError) {
    return c.json(
      {
        error: {
          code: err.code,
          message: err.message,
          requestId,
          ...(err.details !== undefined ? { details: err.details } : {}),
        },
      },
      err.status as ContentfulStatusCode,
    );
  }

  console.error(`[error] ${requestId ?? "-"}`, err);
  return c.json(
    {
      error: { code: "INTERNAL_ERROR", message: "Internal server error", requestId },
    },
    500,
  );
}
