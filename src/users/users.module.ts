import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { DatabaseModule } from 'src/database/database.module';
import { UserRepository } from './repositories/user.repositories';
import { UsersController } from './users.controller';
import { JwtModule } from '@nestjs/jwt';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { AuditLogModule } from 'src/audit-log/audit-log.module';

@Module({
  imports: [DatabaseModule, JwtModule, AuditLogModule],
  providers: [UsersService, UserRepository, RolesGuard],
  controllers: [UsersController],
  exports: [UsersService, UserRepository],
})
export class UsersModule {}
