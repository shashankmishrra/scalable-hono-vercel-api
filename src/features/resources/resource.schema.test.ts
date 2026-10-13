import { describe, expect, it } from "vitest";

import { createResourceSchema, listResourcesSchema, resourceIdSchema, updateResourceSchema } from "./resource.schema";

describe("createResourceSchema", () => {
  it("accepts a valid name and slug", () => {
    expect(createResourceSchema.safeParse({ name: "AI Agents", slug: "ai-agents" }).success).toBe(true);
  });

  it("rejects an empty name", () => {
    expect(createResourceSchema.safeParse({ name: "", slug: "ai-agents" }).success).toBe(false);
  });

  it("rejects an invalid slug", () => {
    expect(createResourceSchema.safeParse({ name: "X", slug: "Bad Slug!" }).success).toBe(false);
  });
});

describe("updateResourceSchema", () => {
  it("accepts a partial update", () => {
    expect(updateResourceSchema.safeParse({ name: "New name" }).success).toBe(true);
  });

  it("rejects an empty update", () => {
    expect(updateResourceSchema.safeParse({}).success).toBe(false);
  });
});

describe("resourceIdSchema", () => {
  it("accepts a UUID", () => {
    expect(resourceIdSchema.safeParse({ id: crypto.randomUUID() }).success).toBe(true);
  });

  it("rejects a non-UUID", () => {
    expect(resourceIdSchema.safeParse({ id: "not-a-uuid" }).success).toBe(false);
  });
});

describe("listResourcesSchema", () => {
  it("applies defaults for page and pageSize", () => {
    const result = listResourcesSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.pageSize).toBe(20);
    }
  });

  it("rejects an invalid sort field", () => {
    expect(listResourcesSchema.safeParse({ sort: "owner:asc" }).success).toBe(false);
  });

  it("accepts a known sort and status filter", () => {
    expect(listResourcesSchema.safeParse({ sort: "created_at:desc", status: "pending" }).success).toBe(true);
  });
});
