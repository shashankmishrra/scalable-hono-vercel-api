import { eq } from "drizzle-orm";

import { db } from "@/db";
import { resources } from "@/db/schema/resources";
import { buildWhere } from "@/lib/crud/build-where";

import type { ListResourcesParams } from "./resource.types";

export const resourceModel = {
  table: resources,
  idColumn: resources.id,

  async findBySlug(slug: string) {
    const rows = await db.select().from(resources).where(eq(resources.slug, slug)).limit(1);
    return rows[0] ?? null;
  },

  buildListWhere(params: ListResourcesParams) {
    return buildWhere(params, {
      status: { column: resources.status, operator: "eq" },
      q: { column: resources.name, operator: "contains" },
    });
  },
};
