import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { OrderRepository } from './repositories/order.repositories';
import {
  adminOrders,
  GetOrderDetails,
  Order,
  OrdersDataByUser,
} from './interface';
import { PaymentsService } from 'src/payments/payments.service';
import { Transaction } from 'src/payments/interface';
import { ProductRepository } from 'src/products/repositories/product.repositories';
import { OrderDto } from './dto/create-order.dto';
import { GetOrderDto } from './dto/get-order.dto';
import { UserRepository } from 'src/users/repositories/user.repositories';
import { AuditLogRepository } from 'src/audit-log/repositories/audit-log.repository';

@Injectable()
export class OrdersService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly paymentService: PaymentsService,
    private readonly productRepository: ProductRepository,
    private readonly usersRepository: UserRepository,
    private readonly auditLogRepository: AuditLogRepository,
  ) {}

  async createOrder(
    orderData: OrderDto,
    userId: string,
  ): Promise<{
    success: boolean;
    message: string;
    data: {
      order: Order;
      payment: Transaction;
    };
  }> {
    //cek user, apakah user valid?
    const user = await this.usersRepository.findUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // cek quanitity
    if (orderData.quantity < 1) {
      throw new BadRequestException('Invalid quantity');
    }

    //ambil produk berdasarkan data order
    const product = await this.productRepository.getProductInfo(
      orderData.gameId,
      orderData.value,
    );

    //kalau product tidak ada throw err
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const preparedData = {
      ...orderData,
      userId: user.userId,
      email: user.email,
      customerName: user.name,
      gameName: product.gameName,
      type: product.type,
    };

    let order;

    if (product.type === 'topup') {
      // Produk direct topup harus memiliki target
      if (!orderData.target || orderData.target.trim() === '') {
        throw new BadRequestException(
          'Target is required for direct topup products',
        );
      }
      //proses order tipe topup
      order = await this.orderRepository.createDirectTopup(preparedData);
    } else if (product.type === 'voucher') {
      // Produk voucher reguler tidak boleh memiliki target
      if (orderData.target && orderData.target.trim() !== '') {
        throw new BadRequestException(
          'Target should not be provided for regular vouchers',
        );
      }
      //proses order tipe voucher
      order = await this.orderRepository.createVoucherOrder(preparedData);
    } else {
      throw new BadRequestException('Service not available');
    }

    if (!order) {
      throw new InternalServerErrorException('Failed to create order');
    }

    //prepare payment
    let paymentResponse: {
      success: boolean;
      message: string;
      data: Transaction;
    };

    try {
      //call midtrans buat url payment
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

      // fallback kalo midtrans nguwawor
      await this.orderRepository.fallbackDeleteOrder(order.orderId, order.type);

      console.log('successfully fallback');

      throw new InternalServerErrorException('Failed to process payment');
    }

    return {
      success: true,
      message: 'Order created successfully',
      data: { order, payment: paymentResponse.data },
    };
  }

  async findOrdersByUser(query: GetOrderDto): Promise<{
    success: boolean;
    message: string;
    data?: {
      orders: OrdersDataByUser;
    };
  }> {
    const user = await this.usersRepository.findUserById(query.userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const orders = await this.orderRepository.getOrdersByUser(query.userId);

    if (orders.length === 0) {
      return {
        success: true,
        message: "User doesn't have any orders",
      };
    }

    return {
      success: true,
      message: 'Successfully fetched orders',
      data: {
        orders: orders,
      },
    };
  }

  async getOrderDetails(
    orderId: string,
    userId: string,
  ): Promise<{
    success: boolean;
    message: string;
    data: GetOrderDetails;
  }> {
    const user = await this.usersRepository.findUserById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const data = await this.orderRepository.getOrderDetails(
      orderId,
      user.userId,
    );

    if (data.userId !== user.userId) {
      throw new ForbiddenException(
        'you dont have permission to see this order',
      );
    } else if (!data) {
      throw new NotFoundException('no order data for this order id');
    }

    return {
      success: true,
      message: 'successfully fetch order details',
      data: data,
    };
  }

  async updateOrderStatus(
    orderId: string,
    status: 'pending' | 'completed' | 'cancelled' | 'processed' | 'failed',
    adminId: string,
  ): Promise<{
    success: boolean;
    message: string;
    data: Omit<Order, 'quantity' | 'productsOrder'>;
  }> {
    const order = await this.orderRepository.updateOrderStatus(orderId, status);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    await this.auditLogRepository.createLog(
      adminId,
      `Changed status to ${status} for order ${orderId}`,
    );

    return {
      success: true,
      message: 'Order status updated successfully',
      data: order,
    };
  }

  async cancelOrder(
    orderId: string,
    userId: string,
  ): Promise<{
    success: boolean;
    message: string;
    data: Omit<Order, 'quantity' | 'productsOrder'>;
  }> {
    const order = await this.orderRepository.cancelOder(orderId, userId);
    if (!order) {
      throw new InternalServerErrorException('Failed to cancel order');
    }

    return {
      success: true,
      message: 'success cancelling order',
      data: order,
    };
  }

  async getAllOrders(
    page: number,
    limit: number,
  ): Promise<{
    success: boolean;
    message: string;
    data: adminOrders[];
  }> {
    const orders = await this.orderRepository.getAllOrders(page, limit);

    if (!orders) {
      throw new InternalServerErrorException('failed to fetch orders');
    }

    return {
      success: true,
      message: 'Orders fetched successfully',
      data: orders,
    };
  }
}
