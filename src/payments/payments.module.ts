import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { DatabaseModule } from 'src/database/database.module';
import { PaymentRepository } from './repositories/payments.repositories';
import { PaymentsOrdersSharedModule } from 'src/payments-orders-shared/payments-orders-shared.module';
import { PaymentsOrdersSharedService } from 'src/payments-orders-shared/payments-orders-shared.service';
import { PaymentsOrdersSharedRepositories } from 'src/payments-orders-shared/repositories/payments-orders-shared.repositories';
import { ProductsModule } from 'src/products/products.module';
import { ProductRepository } from 'src/products/repositories/product.repositories';

@Module({
  imports: [DatabaseModule, PaymentsOrdersSharedModule, ProductsModule],
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    PaymentRepository,
    PaymentsOrdersSharedService,
    PaymentsOrdersSharedRepositories,
    ProductRepository,
  ],
})
export class PaymentsModule {}
