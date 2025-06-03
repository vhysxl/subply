import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { DatabaseModule } from 'src/database/database.module';
import { ProductRepository } from './repositories/product.repositories';
import { JwtModule } from '@nestjs/jwt';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { GamesModule } from 'src/games/games.module';
import { GamesRepository } from 'src/games/repositories/games.repositories';

@Module({
  imports: [DatabaseModule, JwtModule, GamesModule],
  controllers: [ProductsController],
  providers: [ProductsService, ProductRepository, RolesGuard, GamesRepository],
})
export class ProductsModule {}
