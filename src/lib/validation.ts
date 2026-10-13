import type { z } from "zod";

import { ValidationError } from "./errors/app-error";

/** Where the input comes from when validating an incoming request. */
export type ParseSource = "json" | "query" | "param";

/**
 * Minimal structural view of a Hono request. Kept structural (rather than
 * importing Hono) so the parser stays framework-independent; any request object
 * exposing these methods satisfies it.
 */
export interface ParsableRequest {
  json(): Promise<unknown>;
  query(): Record<string, string>;
  param(): Record<string, string>;
}

/**
 * Validates raw input directly against the schema, returning the parsed output
 * typed from `z.output`. Used when the data is already available in memory.
 */
export async function parse<S extends z.ZodType>(schema: S, data: unknown): Promise<z.output<S>>;

/**
 * Extracts input from a Hono request (JSON body, query params, or route params)
 * and validates it against the schema.
 */
export async function parse<S extends z.ZodType>(
  schema: S,
  req: ParsableRequest,
  source: ParseSource,
): Promise<z.output<S>>;

export async function parse<S extends z.ZodType>(
  schema: S,
  input: unknown,
  source?: ParseSource,
): Promise<z.output<S>> {
  const data = await extractInput(input, source);
  return validate(schema, data);
}

/**
 * Resolves the raw value to validate: passes raw data through unchanged, or
 * pulls the relevant part out of the request for a given source.
 */
async function extractInput(input: unknown, source?: ParseSource): Promise<unknown> {
  if (source === undefined) {
    return input;
  }
  // The overload above guarantees `input` is a request whenever `source` is set.
  const req = input as ParsableRequest;
  switch (source) {
    case "json":
      return readJson(req);
    case "query":
      return req.query();
    case "param":
      return req.param();
  }
}

/**
 * Reads the JSON body, translating only malformed JSON into a validation error.
 * Other read failures (e.g. an already-consumed body) are rethrown so they
 * surface as a 500 rather than being mislabeled as client input errors.
 */
async function readJson(req: ParsableRequest): Promise<unknown> {
  try {
    return await req.json();
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new ValidationError("VALIDATION_ERROR", "Invalid request input", [
        { path: "", message: "Request body must be valid JSON" },
      ]);
    }
    throw error;
  }
}

/** Single Zod validation path shared by every source. */
function validate<S extends z.ZodType>(schema: S, data: unknown): z.output<S> {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ValidationError(
      "VALIDATION_ERROR",
      "Invalid request input",
      // Flatten issues into a serialisable shape (dot-separated paths) rather
      // than leaking the raw Zod error object to the client.
      result.error.issues.map((issue) => ({
        path: issue.path.map(String).join("."),
        message: issue.message,
      })),
    );
  }
  return result.data;
}
