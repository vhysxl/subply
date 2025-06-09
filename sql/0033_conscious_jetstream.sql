CREATE TABLE "audit_logs" (
	"audit_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admin_id" uuid,
	"action" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_admin_id_users_user_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;