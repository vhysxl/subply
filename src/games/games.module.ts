import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { GamesService } from './games.service';
import { GamesController } from './games.controller';
import { DatabaseModule } from 'src/database/database.module';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { GamesRepository } from './repositories/games.repositories';

@Module({
  imports: [DatabaseModule, JwtModule],
  controllers: [GamesController],
  providers: [GamesService, GamesRepository, RolesGuard],
})
export class GamesModule {}
