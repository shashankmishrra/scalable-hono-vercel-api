import { and, eq, ilike, type SQL } from "drizzle-orm";
import type { PgColumn } from "drizzle-orm/pg-core";

/** Supported filter operators: exact match or case-insensitive substring. */
export type FilterOperator = "eq" | "contains";

/** Maps a filter to the column it applies to and how to match it. */
export interface FilterDefinition {
  column: PgColumn;
  operator: FilterOperator;
}

/**
 * Builds a Drizzle `where` clause from validated filter params. `definitions`
 * is an allowlist of supported filters, so unknown keys in `filters` are
 * silently ignored rather than interpolated into SQL — this is what prevents
 * injection and keeps filters scoped to what each feature explicitly exposes.
 *
 * Returns `undefined` when no filters matched, so the caller can run an
 * unfiltered query.
 */
export function buildWhere(
  filters: Record<string, unknown>,
  definitions: Record<string, FilterDefinition>,
): SQL | undefined {
  const conditions: SQL[] = [];

  for (const [key, { column, operator }] of Object.entries(definitions)) {
    const value = filters[key];
    // Skip absent or empty values so `?status=` behaves like "no filter".
    if (value === undefined || value === null || value === "") {
      continue;
    }

    if (operator === "contains") {
      conditions.push(ilike(column, `%${String(value)}%`));
    } else {
      // Values are Zod-validated upstream, so the cast is safe at runtime.
      conditions.push(eq(column, value as never));
    }
  }

  // AND the conditions together; return undefined (not empty SQL) so callers can
  // distinguish "no filter" from "no matching rows".
  return conditions.length > 0 ? and(...conditions) : undefined;
}
