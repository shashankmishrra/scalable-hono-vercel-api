import { describe, expect, it } from "vitest";

import { app } from "@/api/app";

describe("GET /api/health", () => {
  it("responds with ok and the current environment", async () => {
    const response = await app.request("/api/health");

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ status: "ok" });
  });

  it("echoes an inbound request id", async () => {
    const response = await app.request("/api/health", {
      headers: { "x-request-id": "trace-123" },
    });

    expect(response.headers.get("x-request-id")).toBe("trace-123");
  });
});

describe("error envelope", () => {
  it("returns 400 for a malformed JSON body instead of 500", async () => {
    const response = await app.request("/api/resources", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{ not json",
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: { code: "VALIDATION_ERROR" },
    });
  });

  it("returns a JSON 404 envelope for an unknown route", async () => {
    const response = await app.request("/api/does-not-exist");

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toMatchObject({ error: { code: "NOT_FOUND" } });
  });
});
