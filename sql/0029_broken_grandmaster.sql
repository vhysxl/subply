ALTER TABLE "products" DROP CONSTRAINT "products_game_id_games_game_id_fk";
--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_game_id_games_game_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("game_id") ON DELETE cascade ON UPDATE no action;