CREATE TYPE "public"."role" AS ENUM('admin', 'user', 'superadmin');--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "role" "role" DEFAULT 'user' NOT NULL;