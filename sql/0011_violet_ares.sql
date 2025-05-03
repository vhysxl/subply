ALTER TABLE "vouchers" RENAME TO "products";--> statement-breakpoint
ALTER TABLE "orders" DROP CONSTRAINT "orders_voucher_id_vouchers_id_fk";
--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_voucher_id_products_id_fk" FOREIGN KEY ("voucher_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;