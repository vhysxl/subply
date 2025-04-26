import { Inject, Injectable } from '@nestjs/common';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { DATABASE_CONNECTION } from 'src/database/database-connection';
import * as schemas from 'schemas/index';
import { QuickOrder } from '../interface';
import { and, eq } from 'drizzle-orm';

@Injectable()
export class OrderRepository {
  constructor(
    @Inject(DATABASE_CONNECTION) private db: NeonDatabase<typeof schemas>,
  ) {}

  async createQuickOrder({ userId, value, type }: QuickOrder) {
    try {
      const order = await this.db.transaction(async (trx) => {
        const availableVouchers = await trx
          .select()
          .from(schemas.vouchersTable)
          .where(
            and(
              eq(schemas.vouchersTable.status, 'available'),
              eq(schemas.vouchersTable.type, type),
              eq(schemas.vouchersTable.value, value),
            ),
          )
          .limit(1);

        if (availableVouchers.length === 0) {
          throw new Error('No available vouchers found');
        }

        const [newOrder] = await trx
          .insert(schemas.ordersTable)
          .values({
            userId: userId,
            voucherId: availableVouchers[0].id,
            value: availableVouchers[0].value,
            priceTotal: availableVouchers[0].price,
            type: availableVouchers[0].type,
            status: 'pending',
            target: '',
          })
          .returning(); // kembalikan data order yang baru diinsert

        await trx
          .update(schemas.vouchersTable)
          .set({
            status: 'used',
            updatedAt: new Date(),
          })
          .where(eq(schemas.vouchersTable.id, availableVouchers[0].id));

        return newOrder;
      });

      return order;
    } catch (error) {
      console.error('Error creating quick order:', error);
      throw new Error('Error creating quick order');
    }
  }
}
