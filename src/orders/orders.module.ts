import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { DatabaseModule } from 'src/database/database.module';
import { OrderRepository } from './repositories/order.repositories';
import { PaymentsModule } from 'src/payments/payments.module';
import { ProductsModule } from 'src/products/products.module';
import { JwtModule } from '@nestjs/jwt';
import { PaymentsOrdersSharedModule } from 'src/payments-orders-shared/payments-orders-shared.module';
import { GamesModule } from 'src/games/games.module';
import { UsersModule } from 'src/users/users.module';
import { AuditLogModule } from 'src/audit-log/audit-log.module';

@Module({
  imports: [
    DatabaseModule,
    PaymentsModule,
    ProductsModule,
    JwtModule,
    PaymentsOrdersSharedModule,
    GamesModule,
    UsersModule,
    AuditLogModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService, OrderRepository],
})
export class OrdersModule {}
