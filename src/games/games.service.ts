import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateGameDto } from './dto/create-game.dto';
import { GamesRepository } from './repositories/games.repositories';
import { Games } from './interface';
import { UpdateGameDto } from './dto/update-game.dto';

@Injectable()
export class GamesService {
  constructor(private readonly gamesRepository: GamesRepository) {}

  async createGames(createGameDto: CreateGameDto): Promise<{
    success: boolean;
    message: string;
    data: CreateGameDto;
  }> {
    const game = await this.gamesRepository.createGame(createGameDto);

    if (!game) {
      throw new InternalServerErrorException('Failed to create game');
    }

    return {
      success: true,
      message: 'Game created successfully',
      data: game[0],
    };
  }

  async findAll(): Promise<{
    success: boolean;
    message: string;
    data: Games[];
  }> {
    const games = await this.gamesRepository.getAllGames();
    if (!games) {
      throw new InternalServerErrorException('Failed to fetch games');
    }
    return {
      success: true,
      message: 'Games fetched successfully',
      data: games,
    };
  }

  async updateGame(
    gameId: string,
    gameData: UpdateGameDto,
  ): Promise<{
    success: boolean;
    message: string;
    data: Games;
  }> {
    const result = await this.gamesRepository.updateGame(gameId, gameData);
    if (!result) {
      throw new InternalServerErrorException('Failed to update game');
    }
    return {
      success: true,
      message: 'Game updated successfully',
      data: result,
    };
  }

  async removeGame(gameId: string): Promise<{
    success: boolean;
    message: string;
    data: Games;
  }> {
    const result = await this.gamesRepository.deleteGame(gameId);

    if (!result) {
      throw new InternalServerErrorException('Failed to delete game');
    }

    return {
      success: true,
      message: 'Game deleted successfully',
      data: result[0],
    };
  }
}
