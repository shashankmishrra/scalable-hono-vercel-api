import { describe, expect, it } from "vitest";
import { app } from "@/server/api";

describe("GET /api/health", () => {
  it("responds with ok and the current environment", async () => {
    const response = await app.request("/api/health");

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ status: "ok" });
  });
});
