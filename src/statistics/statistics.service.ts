import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { OrderRepository } from 'src/orders/repositories/order.repositories';
import { PaymentsOrdersSharedRepositories } from 'src/payments-orders-shared/repositories/payments-orders-shared.repositories';
import { UserRepository } from 'src/users/repositories/user.repositories';
import { StatisticsRepository } from './repositories/statistics.repositories';

@Injectable()
export class StatisticsService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly usersRepository: UserRepository,
    private readonly paymentOrdersSharedRepository: PaymentsOrdersSharedRepositories,
    private readonly statisticsRepository: StatisticsRepository,
  ) {}

  async getTotalDailyOrders(): Promise<{
    success: boolean;
    message: string;
    data: number;
  }> {
    const total = await this.orderRepository.newOrdersToday();

    if (total === null) {
      throw new InternalServerErrorException(
        'Failed to fetch total daily orders',
      );
    }

    return {
      success: true,
      message: 'succes fetch daily total orders',
      data: total,
    };
  }

  async getTotalDailyNewUser(): Promise<{
    success: boolean;
    message: string;
    data: number;
  }> {
    const total = await this.usersRepository.newUsersToday();

    if (total === null) {
      throw new InternalServerErrorException('Failed to daily new user');
    }

    return {
      success: true,
      message: 'succes fetch daily total new users',
      data: total,
    };
  }

  async getUnprocessedOrders(): Promise<{
    success: boolean;
    message: string;
    data: number;
  }> {
    const total =
      await this.paymentOrdersSharedRepository.getPaidPendingOrders();

    if (total === null) {
      throw new InternalServerErrorException(
        'Failed to fetch unprocessed orders',
      );
    }

    return {
      success: true,
      message: 'succes fetch unprocessed orders',
      data: total,
    };
  }

  async getDailyRevenue(): Promise<{
    success: boolean;
    message: string;
    data: number;
  }> {
    const total = await this.orderRepository.getDailyCompletedRevenue();

    if (total === null) {
      throw new InternalServerErrorException(
        'Failed to fetch unprocessed orders',
      );
    }

    return {
      success: true,
      message: 'succes fetch revenue',
      data: total,
    };
  }

  async getMonthlySalesReport(year: number, month: number) {
    const [summary, breakdown] = await Promise.all([
      this.statisticsRepository.getMonthlySalesReport(year, month),
      this.statisticsRepository.getMonthlySalesBreakdown(year, month),
    ]);

    return {
      success: true,
      message: 'Monthly sales report generated',
      data: {
        period: `${year}-${month}`,
        summary,
        breakdown,
      },
    };
  }
}
