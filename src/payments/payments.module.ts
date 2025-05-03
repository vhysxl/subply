import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { DatabaseModule } from 'src/database/database.module';
import { PaymentRepository } from './repositories/payments.repositories';

@Module({
  imports: [DatabaseModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, PaymentRepository],
})
export class PaymentsModule {}
