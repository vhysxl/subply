import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { DatabaseModule } from 'src/database/database.module';
import { UserRepository } from './repositories/user.repositories';

@Module({
  imports: [DatabaseModule],
  providers: [UsersService, UserRepository],
  exports: [UsersService],
})
export class UsersModule {}
