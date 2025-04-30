import { Body, Controller, Post } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('status')
  getPaymentStatus(@Body() statusData: any) {
    console.log(statusData);
  }
}
