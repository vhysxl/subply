import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { DatabaseModule } from 'src/database/database.module';
import { ProductRepository } from './repositories/product.repositories';
import { JwtModule } from '@nestjs/jwt';
import { RolesGuard } from 'src/common/guards/roles.guard';

@Module({
  imports: [DatabaseModule, JwtModule],
  controllers: [ProductsController],
  providers: [ProductsService, ProductRepository, RolesGuard],
})
export class ProductsModule {}
