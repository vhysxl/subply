import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { OrderRepository } from './repositories/order.repositories';
import { Order } from './interface';
import { PaymentsService } from 'src/payments/payments.service';
import { Transaction } from 'src/payments/interface';
import { ProductRepository } from 'src/products/repositories/product.repositories';
import { OrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly paymentService: PaymentsService,
    private readonly productRepository: ProductRepository,
  ) {}

  async createOrder(orderData: OrderDto): Promise<{
    success: boolean;
    message: string;
    data: {
      order: Order;
      payment: Transaction;
    };
  }> {
    if (orderData.quantity < 1) {
      throw new BadRequestException('Invalid quantity');
    }

    const product = await this.productRepository.getProductInfo(
      orderData.gameId,
      orderData.value,
    );

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    let order;

    if (product.type === 'topup') {
      // Produk direct topup harus memiliki target
      if (!orderData.target || orderData.target.trim() === '') {
        throw new BadRequestException(
          'Target is required for direct topup products',
        );
      }
      order = await this.orderRepository.createDirectTopup(orderData);
    } else if (product.type === 'voucher') {
      // Produk voucher reguler tidak boleh memiliki target
      if (orderData.target && orderData.target.trim() !== '') {
        throw new BadRequestException(
          'Target should not be provided for regular vouchers',
        );
      }
      order = await this.orderRepository.createVoucherOrder(orderData);
    } else {
      throw new BadRequestException('Service not available');
    }

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
        order.orderId,
        order.email,
        order.customerName,
        order.priceTotal,
      );

      if (!paymentResponse.data) {
        throw new InternalServerErrorException('Failed to process payment');
      }
    } catch (error) {
      console.error('Error in payment, fallback deleting order...', error);
      await this.orderRepository.fallbackDeleteOrder(
        order.orderId,
        order.productId || '',
        order.type,
      );
      throw new InternalServerErrorException('Failed to process payment');
    }

    return {
      success: true,
      message: 'Order created successfully',
      data: { order, payment: paymentResponse.data },
    };
  }
}
