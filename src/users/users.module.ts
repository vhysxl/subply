import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { DatabaseModule } from 'src/database/database.module';
import { UserRepository } from './repositories/user.repositories';
import { UsersController } from './users.controller';
import { JwtModule } from '@nestjs/jwt';
import { RolesGuard } from 'src/common/guards/roles.guard';

@Module({
  imports: [DatabaseModule, JwtModule],
  providers: [UsersService, UserRepository, RolesGuard],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
