ALTER TYPE "public"."order_status" ADD VALUE 'processed';--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "payment_link" varchar(255);