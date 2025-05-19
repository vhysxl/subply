import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { DATABASE_CONNECTION } from 'src/database/database-connection';
import * as schemas from 'schemas/index';
import { eq } from 'drizzle-orm';

@Injectable()
export class PaymentsOrdersSharedRepositories {
  constructor(
    @Inject(DATABASE_CONNECTION) private db: NeonDatabase<typeof schemas>,
  ) {}

  async updateOrderStatusByPayments(
    transaction_status: string,
    orderId: string,
  ) {
    try {
      const [order] = await this.db
        .select({ type: schemas.ordersTable.type })
        .from(schemas.ordersTable)
        .where(eq(schemas.ordersTable.orderId, orderId));

      if (!order) throw new NotFoundException('Order not found');

      const intermediateStatus =
        transaction_status === 'paid'
          ? 'processed'
          : transaction_status === 'expired'
            ? 'failed'
            : transaction_status === 'pending'
              ? 'pending'
              : 'failed';

      const finalStatus =
        order.type === 'voucher' && intermediateStatus === 'processed'
          ? 'completed'
          : intermediateStatus;

      const [result] = await this.db
        .update(schemas.ordersTable)
        .set({ status: finalStatus })
        .where(eq(schemas.ordersTable.orderId, orderId))
        .returning();

      return result;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Failed to update order');
    }
  }
}
