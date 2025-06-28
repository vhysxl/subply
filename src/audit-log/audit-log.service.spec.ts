import { Test, TestingModule } from '@nestjs/testing';
import { AuditLogService } from './audit-log.service';
import { AuditLogRepository } from './repositories/audit-log.repository';
import { InternalServerErrorException } from '@nestjs/common';

describe('AuditLogService', () => {
  let auditLogService: AuditLogService;
  let mockAuditRepository: {
    getAllAudits: jest.Mock;
  };

  beforeEach(async () => {
    mockAuditRepository = {
      getAllAudits: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditLogService,
        {
          provide: AuditLogRepository,
          useValue: mockAuditRepository,
        },
      ],
    }).compile();

    auditLogService = module.get<AuditLogService>(AuditLogService);
  });

  describe('getAllAudits', () => {
    it('should return audit logs', async () => {
      const dummyAudits = [
        {
          auditId: '1',
          adminId: '123',
          adminName: 'Admin',
          activity: 'Login',
          createdAt: new Date(),
        },
      ];

      mockAuditRepository.getAllAudits.mockResolvedValue(dummyAudits);

      const result = await auditLogService.getAllAudits(1, 10);

      expect(mockAuditRepository.getAllAudits).toHaveBeenCalledWith(1, 10);
      expect(result).toEqual({
        success: true,
        message: 'Audit fetched successfully',
        data: dummyAudits,
      });
    });

    it('should throw error if audits not found', async () => {
      mockAuditRepository.getAllAudits.mockResolvedValue(null);

      await expect(auditLogService.getAllAudits(1, 10)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
