ALTER TABLE "orders" ADD COLUMN "name" varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "email" varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_email_users_email_fk" FOREIGN KEY ("email") REFERENCES "public"."users"("email") ON DELETE set null ON UPDATE no action;