CREATE TABLE "order_products" (
	"order_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	CONSTRAINT "order_products_pkey" PRIMARY KEY("order_id","product_id")
);
--> statement-breakpoint
ALTER TABLE "order_products" ADD CONSTRAINT "order_products_order_id_orders_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("order_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_products" ADD CONSTRAINT "order_products_product_id_products_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("product_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "product_ids";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "quantity";