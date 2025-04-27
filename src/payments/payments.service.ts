import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Transaction } from './interface';

@Injectable()
export class PaymentsService {
  constructor() {}
  private readonly midtransUrl =
    'https://app.sandbox.midtrans.com/snap/v1/transactions';
  private readonly serverKey = process.env.MIDTRANS_SERVER_KEY;

  async createPaymentIntent(
    order_id: string,
    email: string,
    name: string,
    totalPrice: number,
  ): Promise<{
    success: boolean;
    message: string;
    data: Transaction;
  }> {
    const payload = {
      transaction_details: {
        order_id: order_id,
        gross_amount: totalPrice,
      },
      credit_card: {
        secure: true,
      },
      customer_details: {
        first_name: name,
        last_name: '',
        email: email,
        phone: '',
      },
    };

    try {
      const response = await fetch(this.midtransUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${Buffer.from(this.serverKey + ':').toString(
            'base64',
          )}`,
        },
        body: JSON.stringify(payload),
      });

      const result = (await response.json()) as Transaction;

      console.log('Midtrans response:', result);

      if (!result.redirect_url || !result.token) {
        throw new BadRequestException('Invalid response from Midtrans');
      }

      console.log('Midtrans response:', result);

      return {
        success: true,
        message: 'Payment intent created successfully',
        data: result,
      };
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw new InternalServerErrorException('Failed to create payment intent');
    }
  }
}
