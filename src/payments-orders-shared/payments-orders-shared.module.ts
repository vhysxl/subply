import { Module } from '@nestjs/common';
import { PaymentsOrdersSharedService } from './payments-orders-shared.service';
import { PaymentsOrdersSharedController } from './payments-orders-shared.controller';
import { DatabaseModule } from 'src/database/database.module';
import { PaymentsOrdersSharedRepositories } from './repositories/payments-orders-shared.repositories';

@Module({
  imports: [DatabaseModule],
  controllers: [PaymentsOrdersSharedController],
  providers: [PaymentsOrdersSharedService, PaymentsOrdersSharedRepositories],
  exports: [PaymentsOrdersSharedService, PaymentsOrdersSharedRepositories],
})
export class PaymentsOrdersSharedModule {}
