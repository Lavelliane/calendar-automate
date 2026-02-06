import { index, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const task = pgTable(
  "task",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    ticketNumber: text("ticket_number"), // Optional for meetings
    title: text("title").notNull(), // Required - task name or meeting type
    type: text("type").notNull().default("ticket"), // ticket, meeting
    status: text("status").notNull().default("pending"), // pending, scheduled, failed
    durationMinutes: integer("duration_minutes").notNull(),
    scheduledStart: timestamp("scheduled_start"),
    scheduledEnd: timestamp("scheduled_end"),
    calendarEventId: text("calendar_event_id"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("task_user_id_idx").on(table.userId),
    index("task_status_idx").on(table.status),
    index("task_type_idx").on(table.type),
  ],
);
