UPDATE "task" SET "title" = "ticket_number" WHERE "title" IS NULL;--> statement-breakpoint
ALTER TABLE "task" ALTER COLUMN "ticket_number" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "task" ALTER COLUMN "title" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "task" ADD COLUMN "type" text DEFAULT 'ticket' NOT NULL;--> statement-breakpoint
CREATE INDEX "task_type_idx" ON "task" USING btree ("type");