import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { DATABASE_CONNECTION } from 'src/database/database-connection';
import * as schemas from 'schemas/index';
import { Payment } from '../interface';
import { eq } from 'drizzle-orm';

@Injectable()
export class PaymentRepository {
  constructor(
    @Inject(DATABASE_CONNECTION) private db: NeonDatabase<typeof schemas>,
  ) {}

  async findPaymentById(orderId: string) {
    try {
      const result = await this.db
        .select()
        .from(schemas.paymentsTable)
        .where(eq(schemas.paymentsTable.orderId, orderId));

      return result[0] ?? null;
    } catch (error) {
      console.error('Error in findPaymentById:', error);
      return null;
    }
  }

  async updatePayment(statusData: Payment) {
    const orderId = statusData.order_id;

    const newStatus =
      statusData.transaction_status === 'settlement'
        ? 'paid'
        : statusData.transaction_status === 'expired'
          ? 'expired'
          : statusData.transaction_status === 'pending'
            ? 'pending'
            : 'failed';
    try {
      const result = await this.db
        .update(schemas.paymentsTable)
        .set({
          status: newStatus,
          paymentMethod: statusData.issuer
            ? statusData.issuer
            : (statusData.va_numbers[0]?.bank ?? null),
          paidAt:
            newStatus === 'paid'
              ? new Date(Date.now() + 7 * 60 * 60 * 1000) //waktu wib
              : null,
        })
        .where(eq(schemas.paymentsTable.orderId, orderId));

      return result;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('failed to update payment status');
    }
  }

  async createPaymentData(
    orderId: string,
    redirectUrl: string,
    amount: string,
  ) {
    try {
      const result = await this.db.insert(schemas.paymentsTable).values({
        orderId: orderId,
        amount: amount,
        status: 'pending',
        paymentLink: redirectUrl,
        createdAt: new Date(Date.now() + 7 * 60 * 60 * 1000), //waktu wib
      });

      return result;
    } catch (error) {
      console.error(error);
      return;
    }
  }
}
