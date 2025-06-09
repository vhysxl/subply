import { Module } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { AuditLogController } from './audit-log.controller';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseModule } from 'src/database/database.module';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { AuditLogRepository } from './repositories/audit-log.repository';

@Module({
  imports: [DatabaseModule, JwtModule],
  controllers: [AuditLogController],
  providers: [AuditLogService, RolesGuard, AuditLogRepository],
  exports: [AuditLogRepository],
})
export class AuditLogModule {}
