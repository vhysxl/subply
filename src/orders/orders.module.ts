import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { DatabaseModule } from 'src/database/database.module';
import { OrderRepository } from './repositories/order.repositories';
import { PaymentsModule } from 'src/payments/payments.module';
import { PaymentsService } from 'src/payments/payments.service';

@Module({
  imports: [DatabaseModule, PaymentsModule],
  controllers: [OrdersController],
  providers: [OrdersService, OrderRepository, PaymentsService],
})
export class OrdersModule {}
