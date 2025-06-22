import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { DatabaseModule } from 'src/database/database.module';
import { ProductRepository } from './repositories/product.repositories';
import { JwtModule } from '@nestjs/jwt';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { GamesModule } from 'src/games/games.module';
import { AuditLogModule } from 'src/audit-log/audit-log.module';

@Module({
  imports: [DatabaseModule, JwtModule, GamesModule, AuditLogModule],
  controllers: [ProductsController],
  providers: [ProductsService, ProductRepository, RolesGuard],
  exports: [ProductRepository, ProductsService],
})
export class ProductsModule {}
