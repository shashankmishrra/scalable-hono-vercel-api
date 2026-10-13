import { asc, count, desc, eq, type SQL } from "drizzle-orm";
import type { PgColumn, PgTable } from "drizzle-orm/pg-core";
import type { z } from "zod";

import { db as database } from "@/db";

// Drizzle's concrete `db` type ties `.from()` to tables declared in the schema,
// which breaks when operating over a generic table. Erasing the type here keeps
// the SDK generic; precise row/input types are restored at the public boundary.
/* eslint-disable @typescript-eslint/no-explicit-any */
const db = database as any;
/* eslint-enable @typescript-eslint/no-explicit-any */

/** Pagination + sorting options accepted by list operations. */
export interface ListParams {
  page?: number;
  pageSize?: number;
  sort?: string;
}

/** Standardised paginated result envelope returned by list operations. */
export interface ListResult<T> {
  data: T[];
  pagination: { page: number; pageSize: number; total: number };
}

export type SortDirection = "asc" | "desc";

/**
 * Configuration for a CRUD instance. `model` supplies the table and id column,
 * `schema` the Zod create/update schemas (used for type inference only — input
 * is validated at the HTTP boundary), and `sortable` is the allowlist of fields
 * clients may sort by.
 */
export interface CrudConfig<TTable extends PgTable, TCreateOutput, TUpdateOutput> {
  model: { table: TTable; idColumn: PgColumn };
  schema: { create: z.ZodType<TCreateOutput>; update: z.ZodType<TUpdateOutput> };
  sortable: Record<string, PgColumn>;
  defaultSort?: { field: string; direction: SortDirection };
  defaultPageSize?: number;
  maxPageSize?: number;
}

/**
 * Creates a type-safe CRUD object for a single table, standardising the common
 * create/list/get/update/delete mechanics (pagination, sort allowlist, and an
 * optional caller-supplied `where`) so each feature only configures its own
 * table, columns, and schemas.
 */
export function createCrud<TTable extends PgTable, TCreateOutput, TUpdateOutput>(
  config: CrudConfig<TTable, TCreateOutput, TUpdateOutput>,
) {
  type Row = TTable["$inferSelect"];
  type CreateInput = TCreateOutput;
  type UpdateInput = TUpdateOutput;

  const { model } = config;
  const sortable = config.sortable;
  // Fall back to the first configured sort field when none is given, so callers
  // always get deterministic ordering.
  const defaultSort = config.defaultSort ?? {
    field: Object.keys(sortable)[0] ?? "",
    direction: "desc" as const,
  };
  const defaultPageSize = config.defaultPageSize ?? 20;
  const maxPageSize = config.maxPageSize ?? 100;

  // Resolve a `field:direction` string against the sort allowlist, falling back
  // to the default when the field is unknown. The Zod schema also rejects unknown
  // fields, so this is a safety net rather than the primary gate.
  function resolveSort(sort?: string): { column: PgColumn; direction: SortDirection } {
    if (sort) {
      const [field, direction] = sort.split(":");
      const column = sortable[field];
      if (column && (direction === "asc" || direction === "desc")) {
        return { column, direction };
      }
    }
    return {
      column: sortable[defaultSort.field] ?? model.idColumn,
      direction: defaultSort.direction,
    };
  }

  return {
    /** Inserts a row and returns it, letting the DB fill server-owned defaults. */
    async create(data: CreateInput): Promise<Row> {
      const rows = (await db.insert(model.table).values(data).returning()) as Row[];
      return rows[0];
    },

    /** Paginates a filtered list with a stable, deterministic ordering. */
    async list(params: ListParams & { where?: SQL }): Promise<ListResult<Row>> {
      // Clamp page/pageSize into safe bounds so malformed values can't produce
      // negative offsets or unbounded result sets.
      const page = Math.max(1, params.page ?? 1);
      const pageSize = Math.min(maxPageSize, Math.max(1, params.pageSize ?? defaultPageSize));
      const { column, direction } = resolveSort(params.sort);
      const orderBy = direction === "asc" ? asc(column) : desc(column);

      // Count first so `total` reflects the full filtered set, not just the page.
      const countRows = (await db.select({ value: count() }).from(model.table).where(params.where)) as {
        value: number;
      }[];

      const rows = (await db
        .select()
        .from(model.table)
        .where(params.where)
        // Always append the id as a tie-breaker so equal sort values still come
        // back in a stable order across pages.
        .orderBy(orderBy, asc(model.idColumn))
        .limit(pageSize)
        .offset((page - 1) * pageSize)) as Row[];

      return {
        data: rows,
        pagination: {
          page,
          pageSize,
          total: Number(countRows[0]?.value ?? 0),
        },
      };
    },

    /** Returns the row with `id`, or null when it does not exist. */
    async get(id: string): Promise<Row | null> {
      const rows = (await db.select().from(model.table).where(eq(model.idColumn, id)).limit(1)) as Row[];
      return rows[0] ?? null;
    },

    /** Updates the row with `id`, returning the updated row or null if missing. */
    async update(id: string, data: UpdateInput): Promise<Row | null> {
      const rows = (await db.update(model.table).set(data).where(eq(model.idColumn, id)).returning()) as Row[];
      return rows[0] ?? null;
    },

    /** Deletes the row with `id`, returning the removed row or null if missing. */
    async remove(id: string): Promise<Row | null> {
      const rows = (await db.delete(model.table).where(eq(model.idColumn, id)).returning()) as Row[];
      return rows[0] ?? null;
    },
  };
}
