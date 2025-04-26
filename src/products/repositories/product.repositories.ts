import { Inject, Injectable } from '@nestjs/common';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { DATABASE_CONNECTION } from 'src/database/database-connection';
import * as schemas from 'schemas/index';
import { eq, count } from 'drizzle-orm';
import { Voucher } from '../interface';

@Injectable()
export class ProductRepository {
  constructor(
    @Inject(DATABASE_CONNECTION) private db: NeonDatabase<typeof schemas>,
  ) {}

  async getVoucher() {
    try {
      const rawData = await this.db
        .select({
          type: schemas.vouchersTable.type,
          value: schemas.vouchersTable.value,
          price: schemas.vouchersTable.price,
          stock: count(),
        })
        .from(schemas.vouchersTable)
        .where(eq(schemas.vouchersTable.status, 'available'))
        .groupBy(
          schemas.vouchersTable.value,
          schemas.vouchersTable.type,
          schemas.vouchersTable.price,
        )
        .orderBy(schemas.vouchersTable.value);

      if (rawData.length === 0) {
        return [];
      }

      const data: Voucher[] = rawData.map((item) => ({
        type: item.type,
        value: Number(item.value),
        price: Number(item.price),
        stock: item.stock,
      }));

      return data;
    } catch (error) {
      console.error('Error fetching vouchers:', error);
      throw new Error('Error fetching vouchers');
    }
  }
}
