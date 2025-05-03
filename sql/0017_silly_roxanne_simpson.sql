ALTER TABLE "games" RENAME COLUMN "id" TO "game_id";--> statement-breakpoint
ALTER TABLE "orders" RENAME COLUMN "id" TO "order_id";--> statement-breakpoint
ALTER TABLE "payments" RENAME COLUMN "id" TO "payment_id";--> statement-breakpoint
ALTER TABLE "products" RENAME COLUMN "id" TO "product_id";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "id" TO "user_id";--> statement-breakpoint
ALTER TABLE "orders" DROP CONSTRAINT "orders_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "orders" DROP CONSTRAINT "orders_product_id_products_id_fk";
--> statement-breakpoint
ALTER TABLE "payments" DROP CONSTRAINT "payments_order_id_orders_id_fk";
--> statement-breakpoint
ALTER TABLE "products" DROP CONSTRAINT "products_game_id_games_id_fk";
--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_product_id_products_game_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("game_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_orders_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("order_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_game_id_games_game_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("game_id") ON DELETE set null ON UPDATE no action;