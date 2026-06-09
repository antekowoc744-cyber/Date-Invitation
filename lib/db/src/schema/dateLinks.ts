import { pgTable, text, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const dateLinksTable = pgTable("date_links", {
  id: text("id").primaryKey(),
  customMessage: text("custom_message"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  visitCount: integer("visit_count").notNull().default(0),
  yesCount: integer("yes_count").notNull().default(0),
});

export const insertDateLinkSchema = createInsertSchema(dateLinksTable).omit({ createdAt: true, visitCount: true, yesCount: true });
export type InsertDateLink = z.infer<typeof insertDateLinkSchema>;
export type DateLink = typeof dateLinksTable.$inferSelect;
