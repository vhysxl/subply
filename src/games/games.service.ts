import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateGameDto } from './dto/create-game.dto';
import { GamesRepository } from './repositories/games.repositories';
import { Games } from './interface';
import { UpdateGameDto } from './dto/update-game.dto';
import { AuditLogRepository } from 'src/audit-log/repositories/audit-log.repository';

@Injectable()
export class GamesService {
  constructor(
    private readonly gamesRepository: GamesRepository,
    private readonly auditLogRepository: AuditLogRepository,
  ) {}

  async createGames(
    createGameDto: CreateGameDto,
    adminId: string,
  ): Promise<{
    success: boolean;
    message: string;
    data: CreateGameDto;
  }> {
    const game = await this.gamesRepository.createGame(createGameDto);

    if (!game) {
      throw new InternalServerErrorException('Failed to create game');
    }

    await this.auditLogRepository.createLog(
      adminId,
      `Created game: ${game[0].name || game[0].gameId}`,
    );

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
    adminId: string,
  ): Promise<{
    success: boolean;
    message: string;
    data: Games;
  }> {
    const result = await this.gamesRepository.updateGame(gameId, gameData);
    if (!result) {
      throw new InternalServerErrorException('Failed to update game');
    }

    await this.auditLogRepository.createLog(
      adminId,
      `Modified game ${result.name}`,
    );

    return {
      success: true,
      message: 'Game updated successfully',
      data: result,
    };
  }

  async removeGame(
    gameId: string,
    adminId: string,
  ): Promise<{
    success: boolean;
    message: string;
    data: Games;
  }> {
    const result = await this.gamesRepository.deleteGame(gameId);

    if (!result) {
      throw new InternalServerErrorException('Failed to delete game');
    }

    await this.auditLogRepository.createLog(
      adminId,
      `Deleted game ${result[0].name}`,
    );

    return {
      success: true,
      message: 'Game deleted successfully',
      data: result[0],
    };
  }
}
