ALTER TABLE "products" ADD COLUMN "name" varchar(100);--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "is_popular" boolean DEFAULT false NOT NULL;