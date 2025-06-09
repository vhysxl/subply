import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { GamesService } from './games.service';
import { GamesController } from './games.controller';
import { DatabaseModule } from 'src/database/database.module';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { GamesRepository } from './repositories/games.repositories';
import { AuditLogModule } from 'src/audit-log/audit-log.module';

@Module({
  imports: [DatabaseModule, JwtModule, AuditLogModule],
  controllers: [GamesController],
  providers: [GamesService, GamesRepository, RolesGuard],
  exports: [GamesRepository],
})
export class GamesModule {}
