import { Inject, Injectable } from '@nestjs/common';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { DATABASE_CONNECTION } from 'src/database/database-connection';
import * as schemas from 'schemas/index';
import { Payment } from '../interface';

@Injectable()
export class PaymentRepository {
  constructor(
    @Inject(DATABASE_CONNECTION) private db: NeonDatabase<typeof schemas>,
  ) {}

  async createPaymentData(statusData: Payment) {
    const status =
      statusData.transaction_status === 'settlement'
        ? 'paid'
        : statusData.transaction_status === 'expired'
          ? 'expired'
          : statusData.transaction_status === 'pending'
            ? 'pending'
            : 'failed';

    try {
      await this.db.insert(schemas.paymentsTable).values({
        orderId: statusData.order_id,
        amount: statusData.gross_amount,
        status: status,
        paymentMethod: statusData.issuer ?? statusData.payment_type,
        paidAt: statusData.settlement_time
          ? new Date(statusData.settlement_time)
          : undefined,
        createdAt: new Date(statusData.transaction_time),
      });
    } catch (error) {
      console.error(error);
      return;
    }
  }
}
