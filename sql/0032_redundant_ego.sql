ALTER TABLE "orders" RENAME COLUMN "product_id" TO "product_ids";--> statement-breakpoint
ALTER TABLE "orders" DROP CONSTRAINT "orders_product_id_products_product_id_fk";
