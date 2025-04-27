import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { OrderRepository } from './repositories/order.repositories';
import { QuickOrder } from './interface';
import { PaymentsService } from 'src/payments/payments.service';
import { Transaction } from 'src/payments/interface';

@Injectable()
export class OrdersService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly paymentService: PaymentsService,
  ) {}

  async createQuickOrder(quickOrderData: QuickOrder): Promise<{
    success: boolean;
    message: string;
    data: {
      order: QuickOrder;
      payment: Transaction;
    };
  }> {
    const order = await this.orderRepository.createQuickOrder(quickOrderData);

    if (!order) {
      throw new InternalServerErrorException('Failed to create order');
    }

    let paymentResponse: {
      success: boolean;
      message: string;
      data: Transaction;
    };

    try {
      paymentResponse = await this.paymentService.createPaymentIntent(
        order.id,
        order.email,
        order.name,
        order.priceTotal,
      );

      if (!paymentResponse.data) {
        throw new InternalServerErrorException('Failed to process payment');
      }
    } catch (error) {
      console.error('Error in payment, fallback deleting order...', error);
      await this.orderRepository.fallbackDeleteOrder(
        order.id,
        order.voucherId || '',
      );
      throw new InternalServerErrorException('Failed to process payment');
    }

    return {
      success: true,
      message: 'Quick order created successfully',
      data: { order, payment: paymentResponse.data },
    };
  }
}
