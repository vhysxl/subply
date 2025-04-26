import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { OrderRepository } from './repositories/order.repositories';
import { QuickOrder } from './interface';

@Injectable()
export class OrdersService {
  constructor(private readonly orderRepository: OrderRepository) {}

  async createQuickOrder(quickOrderData: QuickOrder): Promise<{
    success: boolean;
    message: string;
    data: QuickOrder;
  }> {
    const order = await this.orderRepository.createQuickOrder(quickOrderData);

    if (!order) {
      throw new InternalServerErrorException('Failed to create quick order');
    }

    return {
      success: true,
      message: 'Quick order created successfully',
      data: order,
    };
  }
}
