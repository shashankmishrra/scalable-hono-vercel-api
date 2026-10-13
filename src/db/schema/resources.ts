import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const resourceStatusEnum = pgEnum("resource_status", ["pending", "completed", "failed"]);

export const resources = pgTable("resources", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  file_path: text("file_path"),
  status: resourceStatusEnum("status").notNull().default("pending"),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

export type Resource = typeof resources.$inferSelect;
export type NewResource = typeof resources.$inferInsert;
