import { Controller } from '@nestjs/common';
import { PaymentsOrdersSharedService } from './payments-orders-shared.service';

@Controller('payments-orders-shared')
export class PaymentsOrdersSharedController {
  constructor(
    private readonly paymentsOrdersSharedService: PaymentsOrdersSharedService,
  ) {}
}
