import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { DATABASE_CONNECTION } from 'src/database/database-connection';
import * as schemas from 'schemas/tables';
import { and, eq, sql } from 'drizzle-orm';

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

      //update status dan paymentlink
      const result = await this.db.transaction(async (trx) => {
        const [orderData] = await trx
          .update(schemas.ordersTable)
          .set({ status: finalStatus })
          .where(eq(schemas.ordersTable.orderId, orderId))
          .returning();

        if (!orderData) {
          throw new InternalServerErrorException('Update failed');
        }

        if (orderData.status === 'completed' || orderData.status === 'failed') {
          await trx
            .update(schemas.paymentsTable)
            .set({ paymentLink: null })
            .where(eq(schemas.paymentsTable.orderId, orderData.orderId));
        }

        return orderData;
      });

      return result;
    } catch (error) {
      console.error(error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update order');
    }
  }

  async getPaidPendingOrders() {
    try {
      const [{ count }] = await this.db
        .select({
          count: sql`COUNT(*)`.as('count'),
        })
        .from(schemas.ordersTable)
        .innerJoin(
          schemas.paymentsTable,
          eq(schemas.ordersTable.orderId, schemas.paymentsTable.orderId),
        )
        .where(
          and(
            eq(schemas.ordersTable.status, 'pending'),
            eq(schemas.paymentsTable.status, 'paid'),
          ),
        );

      return Number(count);
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Failed to count orders');
    }
  }
}
