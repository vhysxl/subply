import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PaymentsOrdersSharedRepositories } from './repositories/payments-orders-shared.repositories';

@Injectable()
export class PaymentsOrdersSharedService {
  constructor(
    private readonly paymentsOrdersSharedRepositories: PaymentsOrdersSharedRepositories,
  ) {}

  async updateOrderStatusByPayments(orderId: string, status: string) {
    try {
      const result =
        await this.paymentsOrdersSharedRepositories.updateOrderStatusByPayments(
          status,
          orderId,
        );

      if (!result) {
        throw new InternalServerErrorException('failed to update order status');
      }

      return result;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
}
