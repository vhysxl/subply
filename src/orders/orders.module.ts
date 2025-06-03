import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { DatabaseModule } from 'src/database/database.module';
import { OrderRepository } from './repositories/order.repositories';
import { PaymentsModule } from 'src/payments/payments.module';
import { PaymentsService } from 'src/payments/payments.service';
import { PaymentRepository } from 'src/payments/repositories/payments.repositories';
import { ProductsModule } from 'src/products/products.module';
import { ProductRepository } from 'src/products/repositories/product.repositories';
import { ProductsService } from 'src/products/products.service';
import { JwtModule } from '@nestjs/jwt';
import { PaymentsOrdersSharedModule } from 'src/payments-orders-shared/payments-orders-shared.module';
import { PaymentsOrdersSharedService } from 'src/payments-orders-shared/payments-orders-shared.service';
import { PaymentsOrdersSharedRepositories } from 'src/payments-orders-shared/repositories/payments-orders-shared.repositories';
import { GamesModule } from 'src/games/games.module';
import { GamesRepository } from 'src/games/repositories/games.repositories';
import { UsersModule } from 'src/users/users.module';
import { UserRepository } from 'src/users/repositories/user.repositories';

@Module({
  imports: [
    DatabaseModule,
    PaymentsModule,
    ProductsModule,
    JwtModule,
    PaymentsOrdersSharedModule,
    GamesModule,
    UsersModule,
  ],
  controllers: [OrdersController],
  providers: [
    OrdersService,
    OrderRepository,
    PaymentsService,
    PaymentRepository,
    ProductRepository,
    ProductsService,
    PaymentsOrdersSharedService,
    PaymentsOrdersSharedRepositories,
    GamesRepository,
    UserRepository,
  ],
})
export class OrdersModule {}
