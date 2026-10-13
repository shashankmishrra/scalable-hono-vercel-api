import { describe, expect, expectTypeOf, it } from "vitest";
import { z } from "zod";

import { ValidationError } from "./errors/app-error";
import { parse, type ParsableRequest } from "./validation";

function request(overrides: Partial<ParsableRequest> = {}): ParsableRequest {
  return {
    json: async () => undefined,
    query: () => ({}),
    param: () => ({}),
    ...overrides,
  };
}

const nameSchema = z.object({ name: z.string() });

describe("raw input", () => {
  it("returns parsed data for valid input", async () => {
    await expect(parse(nameSchema, { name: "Ada" })).resolves.toEqual({ name: "Ada" });
  });

  it("throws ValidationError for invalid input", async () => {
    await expect(parse(nameSchema, { name: 1 })).rejects.toBeInstanceOf(ValidationError);
  });

  it("preserves transformations and defaults", async () => {
    const schema = z.object({
      n: z.coerce.number(),
      tag: z.string().default("untagged"),
    });
    await expect(parse(schema, { n: "5" })).resolves.toEqual({ n: 5, tag: "untagged" });
  });

  it("serializes issue paths and messages correctly", async () => {
    const schema = z.object({ user: z.object({ name: z.string() }) });
    await expect(parse(schema, { user: { name: 42 } })).rejects.toMatchObject({
      details: [{ path: "user.name", message: expect.any(String) }],
    });
  });
});

describe("json source", () => {
  it("parses and validates a valid body", async () => {
    const req = request({ json: async () => ({ name: "Ada" }) });
    await expect(parse(nameSchema, req, "json")).resolves.toEqual({ name: "Ada" });
  });

  it("fails schema validation for invalid body data", async () => {
    const req = request({ json: async () => ({ name: 1 }) });
    await expect(parse(nameSchema, req, "json")).rejects.toBeInstanceOf(ValidationError);
  });

  it("maps malformed JSON to a validation error", async () => {
    const req = request({ json: async () => JSON.parse("{ not json") });
    await expect(parse(nameSchema, req, "json")).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      details: [{ path: "", message: "Request body must be valid JSON" }],
    });
  });

  it("does not mislabel other read failures as malformed JSON", async () => {
    const streamError = new Error("body already consumed");
    const req = request({ json: async () => Promise.reject(streamError) });
    await expect(parse(nameSchema, req, "json")).rejects.toBe(streamError);
  });
});

describe("query source", () => {
  it("extracts and validates query parameters", async () => {
    const schema = z.object({ page: z.coerce.number().int().min(1) });
    const req = request({ query: () => ({ page: "2" }) });
    await expect(parse(schema, req, "query")).resolves.toEqual({ page: 2 });
  });

  it("passes single (first) values for repeated parameters", async () => {
    // The API contract uses scalar query params; Hono's `query()` collapses
    // repeated keys to the first value, so the schema receives strings, not
    // arrays. An array-valued schema would therefore fail here.
    const schema = z.object({ tags: z.string() });
    const req = request({ query: () => ({ tags: "a" }) });
    await expect(parse(schema, req, "query")).resolves.toEqual({ tags: "a" });
  });
});

describe("param source", () => {
  it("extracts and validates route parameters", async () => {
    const schema = z.object({ id: z.string().uuid() });
    const id = crypto.randomUUID();
    const req = request({ param: () => ({ id }) });
    await expect(parse(schema, req, "param")).resolves.toEqual({ id });
  });
});

describe("type safety", () => {
  it("returns the schema's output type", async () => {
    const schema = z.object({ id: z.string(), count: z.number() });
    const result = await parse(schema, { id: "x", count: 1 });
    expectTypeOf(result).toEqualTypeOf<{ id: string; count: number }>();
  });
});
