CREATE TABLE "task" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"ticket_number" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"duration_minutes" integer NOT NULL,
	"scheduled_start" timestamp,
	"scheduled_end" timestamp,
	"calendar_event_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "task" ADD CONSTRAINT "task_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "task_user_id_idx" ON "task" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "task_status_idx" ON "task" USING btree ("status");