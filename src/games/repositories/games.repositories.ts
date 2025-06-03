import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { DATABASE_CONNECTION } from 'src/database/database-connection';
import * as schemas from 'schemas/index';
import { CreateGame, Games } from '../interface';
import { eq } from 'drizzle-orm';

@Injectable()
export class GamesRepository {
  constructor(
    @Inject(DATABASE_CONNECTION) private db: NeonDatabase<typeof schemas>,
  ) {}

  async getAllGames() {
    try {
      const data: Games[] = await this.db.select().from(schemas.games);
      if (data.length === 0) {
        return [];
      } else if (!data) {
        throw new InternalServerErrorException('Failed to get games');
      }

      return data;
    } catch (error) {
      console.error('Error getting all games:', error);
      throw new InternalServerErrorException('Failed to get games');
    }
  }

  async createGame(gameData: CreateGame) {
    try {
      const result = await this.db
        .insert(schemas.games)
        .values({
          name: gameData.name,
          isPopular: gameData.isPopular,
          currency: gameData.currency,
          imageUrl: gameData.imageUrl,
        })
        .returning();

      if (result.length === 0) {
        throw new InternalServerErrorException('Failed to create game');
      }

      return result;
    } catch (error) {
      console.error('Error creating game:', error);
      throw new InternalServerErrorException('Failed to create game');
    }
  }

  async deleteGame(gameId: string) {
    try {
      const result = await this.db
        .delete(schemas.games)
        .where(eq(schemas.games.gameId, gameId))
        .returning();

      if (result.length === 0) {
        throw new NotFoundException(`Game with ID "${gameId}" not found`);
      }

      return result;
    } catch (error) {
      console.error('Error deleting game:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete game');
    }
  }

  async updateGame(gameId: string, gameData: Partial<CreateGame>) {
    try {
      const [result] = await this.db
        .update(schemas.games)
        .set(gameData)
        .where(eq(schemas.games.gameId, gameId))
        .returning();

      if (!result) {
        throw new NotFoundException(`Game with ID "${gameId}" not found`);
      }

      return result;
    } catch (error) {
      console.error('Error updating game:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update game');
    }
  }

  async findGameById(gameId: string) {
    try {
      const [result] = await this.db
        .select()
        .from(schemas.games)
        .where(eq(schemas.games.gameId, gameId));

      if (!result) {
        throw new NotFoundException(`Game with ID "${gameId}" not found`);
      }
      return result;
    } catch (error) {
      console.error('Error finding game by ID:', error);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (error.code === '22P02') {
        throw new NotFoundException(`Game with ID "${gameId}" not found`);
      }
      throw new InternalServerErrorException('Failed to find game by ID');
    }
  }
}
