import { Body, Controller, Post } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('status')
  async getPaymentStatus(@Body() statusData: any) {
    try {
      console.log('Notifikasi Midtrans:', statusData);

      // Proses data notifikasi

      // Kembalikan response 200 yang diharapkan Midtrans
      return { status: 'OK' };
    } catch (error) {
      console.error('Error handling payment notification:', error);
      // Tetap kembalikan 200 agar Midtrans tidak mencoba ulang
      return { status: 'OK' };
    }
  }
}
