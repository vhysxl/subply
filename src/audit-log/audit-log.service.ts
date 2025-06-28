import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { AuditLogRepository } from './repositories/audit-log.repository';

type Audit = {
  auditId: string;
  adminId: string | null;
  adminName: string | null;
  activity: string;
  createdAt: Date | null;
};

@Injectable()
export class AuditLogService {
  constructor(private readonly auditRepository: AuditLogRepository) {}

  async getAllAudits(
    page: number,
    limit: number,
  ): Promise<{
    success: boolean;
    message: string;
    data: Audit[];
  }> {
    const audits = await this.auditRepository.getAllAudits(page, limit);

    if (!audits) {
      throw new InternalServerErrorException('failed to fetch audits');
    }

    return {
      success: true,
      message: 'Audit fetched successfully',
      data: audits,
    };
  }
}
