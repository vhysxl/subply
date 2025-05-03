ALTER TABLE "orders" DROP CONSTRAINT "orders_product_id_products_product_id_fk";
--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_product_id_products_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("product_id") ON DELETE restrict ON UPDATE no action;