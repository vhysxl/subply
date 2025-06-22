import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { DatabaseModule } from 'src/database/database.module';
import { PaymentRepository } from './repositories/payments.repositories';
import { PaymentsOrdersSharedModule } from 'src/payments-orders-shared/payments-orders-shared.module';
import { ProductsModule } from 'src/products/products.module';

@Module({
  imports: [DatabaseModule, PaymentsOrdersSharedModule, ProductsModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, PaymentRepository],
  exports: [PaymentsService, PaymentRepository],
})
export class PaymentsModule {}
