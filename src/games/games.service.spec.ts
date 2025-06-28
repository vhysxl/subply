import { Test, TestingModule } from '@nestjs/testing';
import { GamesService } from './games.service';
import { AuditLogRepository } from 'src/audit-log/repositories/audit-log.repository';
import { GamesRepository } from './repositories/games.repositories';
import { randomUUID } from 'crypto';
import { InternalServerErrorException } from '@nestjs/common';

describe('GamesService', () => {
  let gameService: GamesService;
  let mockAuditLogRepository: {
    createLog: jest.Mock;
  };
  let mockGameRepository: {
    createGame: jest.Mock;
    getAllGames: jest.Mock;
    updateGame: jest.Mock;
    deleteGame: jest.Mock;
  };

  const mockAdminId = randomUUID();

  // create game & get game
  const mockGame = {
    name: 'new game',
    isPopular: true,
    currency: 'game currency',
    imageUrl: 'image.com',
  };

  const mockGameArray = [
    {
      gameId: '1234',
      name: 'new game',
      isPopular: true,
      currency: 'game currency',
      imageUrl: 'image.com',
    },
  ];

  // edit game
  const mockGameId = '12345';

  const mockGameToEdit = {
    name: 'new game2',
    isPopular: true,
    currency: 'game2 currency',
    imageUrl: 'image2.com',
  };

  const mockEditedGame = {
    gameId: '1234',
    name: 'new game2',
    isPopular: true,
    currency: 'game2 currency',
    imageUrl: 'image2.com',
  };

  //test modules
  beforeEach(async () => {
    mockAuditLogRepository = {
      createLog: jest.fn(),
    };

    mockGameRepository = {
      createGame: jest.fn(),
      getAllGames: jest.fn(),
      updateGame: jest.fn(),
      deleteGame: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GamesService,
        {
          provide: AuditLogRepository,
          useValue: mockAuditLogRepository,
        },
        {
          provide: GamesRepository,
          useValue: mockGameRepository,
        },
      ],
    }).compile();

    gameService = module.get<GamesService>(GamesService);
  });

  describe('getAllGames', () => {
    it('should return all games', async () => {
      mockGameRepository.getAllGames.mockResolvedValue(mockGameArray);

      const result = await gameService.findAll();

      expect(mockGameRepository.getAllGames).toHaveBeenCalled();

      expect(result).toEqual({
        success: true,
        message: 'Games fetched successfully',
        data: mockGameArray,
      });
    });

    it('should return internal serber excetions in failed fetch', async () => {
      mockGameRepository.getAllGames.mockResolvedValue(null);

      await expect(gameService.findAll()).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(mockGameRepository.getAllGames).toHaveBeenCalled();
    });
  });

  describe('createGames', () => {
    it('should return newly created game', async () => {
      mockGameRepository.createGame.mockResolvedValue(mockGameArray);
      mockAuditLogRepository.createLog.mockResolvedValue(undefined);

      const result = await gameService.createGames(mockGame, mockAdminId);

      expect(mockGameRepository.createGame).toHaveBeenCalledWith(mockGame);
      expect(mockAuditLogRepository.createLog).toHaveBeenCalledWith(
        mockAdminId,
        `Created game: ${mockGameArray[0].name}`,
      );
      expect(result).toEqual({
        success: true,
        message: 'Game created successfully',
        data: mockGameArray[0],
      });
    });

    it('should throw InternalServerErrorException when game creation fails', async () => {
      mockGameRepository.createGame.mockResolvedValue(null);

      await expect(
        gameService.createGames(mockGame, mockAdminId),
      ).rejects.toThrow(InternalServerErrorException);
      expect(mockGameRepository.createGame).toHaveBeenCalledWith(mockGame);
      expect(mockAuditLogRepository.createLog).not.toHaveBeenCalled();
    });
  });

  describe('updataGames', () => {
    it('should return updated games', async () => {
      mockGameRepository.updateGame.mockResolvedValue(mockEditedGame);
      mockAuditLogRepository.createLog.mockResolvedValue(undefined);

      const result = await gameService.updateGame(
        mockGameId,
        mockGameToEdit,
        mockAdminId,
      );

      expect(mockGameRepository.updateGame).toHaveBeenCalledWith(
        mockGameId,
        mockGameToEdit,
      );
      expect(mockAuditLogRepository.createLog).toHaveBeenCalledWith(
        mockAdminId,
        `Modified game ${mockEditedGame.name}`,
      );
      expect(result).toEqual({
        success: true,
        message: 'Game updated successfully',
        data: mockEditedGame,
      });
    });

    it('should throw InternalSererException when game update fails', async () => {
      mockGameRepository.updateGame.mockResolvedValue(null);

      await expect(
        gameService.updateGame(mockGameId, mockGameToEdit, mockAdminId),
      ).rejects.toThrow(InternalServerErrorException);
      expect(mockGameRepository.updateGame).toHaveBeenCalledWith(
        mockGameId,
        mockGameToEdit,
      );
      expect(mockAuditLogRepository.createLog).not.toHaveBeenCalled();
    });
  });

  describe('deleteGames', () => {
    it('should return deleted games', async () => {
      mockGameRepository.deleteGame.mockResolvedValue(mockGameArray);
      mockAuditLogRepository.createLog.mockResolvedValue(undefined);

      const result = await gameService.removeGame(mockGameId, mockAdminId);

      expect(mockGameRepository.deleteGame).toHaveBeenCalledWith(mockGameId);
      expect(mockAuditLogRepository.createLog).toHaveBeenCalledWith(
        mockAdminId,
        `Deleted game ${mockGameArray[0].name}`,
      );
      expect(result).toEqual({
        success: true,
        message: 'Game deleted successfully',
        data: mockGameArray[0],
      });
    });

    it('should throw internalserverexception when game removal fails', async () => {
      mockGameRepository.deleteGame.mockResolvedValue(null);

      await expect(
        gameService.removeGame(mockGameId, mockAdminId),
      ).rejects.toThrow(InternalServerErrorException);
      expect(mockGameRepository.deleteGame).toHaveBeenCalledWith(mockGameId);
      expect(mockAuditLogRepository.createLog).not.toHaveBeenCalled();
    });
  });
});
