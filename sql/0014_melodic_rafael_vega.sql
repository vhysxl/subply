-- CREATE TYPE "public"."type" AS ENUM('voucher', 'topup');--> statement-breakpoint
CREATE TABLE "games" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"is_popular" boolean DEFAULT false NOT NULL,
	CONSTRAINT "games_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "orders" RENAME COLUMN "voucher_id" TO "product_id";--> statement-breakpoint
ALTER TABLE "orders" RENAME COLUMN "name" TO "customer_name";--> statement-breakpoint
ALTER TABLE "orders" DROP CONSTRAINT "orders_voucher_id_products_id_fk";
--> statement-breakpoint
ALTER TABLE "orders" DROP CONSTRAINT "orders_email_users_email_fk";
--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "type" SET DATA TYPE "public"."type" USING "type"::"public"."type";--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "email" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "type" SET DATA TYPE "public"."type" USING "type"::"public"."type";--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "name" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "game_name" varchar(100);--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "game_id" uuid;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "is_unlimited";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "is_popular";--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_code_unique" UNIQUE("code");