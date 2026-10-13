import type { z } from "zod";

import { ValidationError } from "./errors/app-error";

/**
 * Parses and validates unknown input with a Zod schema, translating failures
 * into a {@link ValidationError} so controllers treat invalid input uniformly
 * without duplicating error-handling logic.
 */
export function parse<T>(schema: z.ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ValidationError(
      "VALIDATION_ERROR",
      "Invalid request input",
      // Flatten the issues into a safe, serialisable shape rather than leaking
      // the raw Zod error object to the client.
      result.error.issues.map((issue) => ({
        path: issue.path.map(String).join("."),
        message: issue.message,
      })),
    );
  }
  return result.data;
}

/**
 * Reads and validates a JSON request body, mapping malformed or empty JSON to a
 * 400 instead of letting the underlying `json()` parse error escape as a 500.
 */
export async function parseJsonBody<T>(schema: z.ZodType<T>, req: { json: () => Promise<unknown> }): Promise<T> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new ValidationError("VALIDATION_ERROR", "Invalid request input", [
      { path: "", message: "Request body must be valid JSON" },
    ]);
  }
  return parse(schema, body);
}
