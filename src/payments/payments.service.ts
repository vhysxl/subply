import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Payment, Transaction } from './interface';
import { PaymentRepository } from './repositories/payments.repositories';
import { PaymentsOrdersSharedService } from 'src/payments-orders-shared/payments-orders-shared.service';

import { ProductRepository } from 'src/products/repositories/product.repositories';
import { Products } from 'src/products/interface';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly paymentsOrdersSharedService: PaymentsOrdersSharedService,
    private readonly productRepositories: ProductRepository,
  ) {}
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

      if (!result.redirect_url || !result.token) {
        throw new BadRequestException('Invalid response from Midtrans');
      }

      const paymentData = await this.paymentRepository.createPaymentData(
        order_id,
        result.redirect_url,
        String(totalPrice),
      );

      if (!paymentData) {
        throw new InternalServerErrorException('Failed to create order');
      }

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

  async setPaymentStatus(statusData: Payment) {
    try {
      console.log(statusData);

      const existingPayment = await this.paymentRepository.findPaymentById(
        statusData.order_id,
      );

      if (!existingPayment) {
        throw new BadRequestException('order data not found');
      }

      const paymentData =
        await this.paymentRepository.updatePayment(statusData);

      if (!paymentData) {
        throw new Error('Failed to update payment');
      }

      const result =
        await this.paymentsOrdersSharedService.updateOrderStatusByPayments(
          paymentData.orderId,
          paymentData.status,
        );

      if (
        result &&
        result.type === 'voucher' &&
        (result.status === 'failed' || result.status === 'cancelled')
      ) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const productIds: string[] = JSON.parse(result.productIds || '[]');

        const updateData: Partial<Products> = {
          status: 'available',
        };

        await this.productRepositories.updateProduct(updateData, productIds);

        console.log(
          `Voucher ${result.productIds} returned to available status`,
        );
      }

      return result;
    } catch (error) {
      console.error('Error in setPaymentStatus:', error);
      throw new InternalServerErrorException(
        'Failed to process payment status',
      );
    }
  }
}
