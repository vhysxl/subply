import { Body, Controller, Post } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { Payment } from './interface';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('status')
  async getPaymentStatus(@Body() statusData: Payment) {
    try {
      await this.paymentsService.setPaymentStatus(statusData);

      return { status: 'OK' };
    } catch (error) {
      console.error('Error handling payment status:', error);
      return { status: 'OK' };
    }
  }
}
