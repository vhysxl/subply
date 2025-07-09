import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { DATABASE_CONNECTION } from 'src/database/database-connection';
import * as schemas from 'schemas/tables';
import { and, eq, gte, lte, sql } from 'drizzle-orm';

@Injectable()
export class StatisticsRepository {
  constructor(
    @Inject(DATABASE_CONNECTION) private db: NeonDatabase<typeof schemas>,
  ) {}

  async getMonthlySalesBreakdown(year: number, month: number) {
    try {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);

      const gameBreakdown = await this.db
        .select({
          gameName: schemas.ordersTable.gameName,
          totalOrders: sql`COUNT(*)`,
          totalRevenue: sql`COALESCE(SUM(${schemas.ordersTable.priceTotal}), 0)`,
          totalQuantity: sql`COALESCE(SUM(${schemas.orderProductsTable.quantity}), 0)`,
        })
        .from(schemas.ordersTable).innerJoin(schemas.orderProductsTable, 
          eq(schemas.ordersTable.orderId, schemas.orderProductsTable.orderId))
        .where(
          and(
            eq(schemas.ordersTable.status, 'completed'),
            gte(schemas.ordersTable.createdAt, startDate),
            lte(schemas.ordersTable.createdAt, endDate),
          ),
        )
        .groupBy(schemas.ordersTable.gameName)
        .orderBy(sql`SUM(${schemas.ordersTable.priceTotal}) DESC`);

      const typeBreakdown = await this.db
        .select({
          type: schemas.ordersTable.type,
          totalOrders: sql`COUNT(*)`,
          totalRevenue: sql`COALESCE(SUM(price_total), 0)`,
        })
        .from(schemas.ordersTable)
        .where(
          and(
            eq(schemas.ordersTable.status, 'completed'),
            gte(schemas.ordersTable.createdAt, startDate),
            lte(schemas.ordersTable.createdAt, endDate),
          ),
        )
        .groupBy(schemas.ordersTable.type);

      return {
        gameBreakdown: gameBreakdown.map((item) => ({
          gameName: item.gameName,
          totalOrders: Number(item.totalOrders),
          totalRevenue: Number(item.totalRevenue),
          totalQuantity: Number(item.totalQuantity),
        })),
        typeBreakdown: typeBreakdown.map((item) => ({
          type: item.type,
          totalOrders: Number(item.totalOrders),
          totalRevenue: Number(item.totalRevenue),
        })),
      };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Failed to generate breakdown');
    }
  }

  async getMonthlySalesReport(year: number, month: number) {
    try {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);

      const [result] = await this.db
        .select({
          totalOrders: sql`COUNT(*)`,
          totalRevenue: sql`COALESCE(SUM(price_total), 0)`,
        })
        .from(schemas.ordersTable)
        .where(
          and(
            eq(schemas.ordersTable.status, 'completed'),
            gte(schemas.ordersTable.createdAt, startDate),
            lte(schemas.ordersTable.createdAt, endDate),
          ),
        );

      return {
        totalOrders: Number(result.totalOrders),
        totalRevenue: Number(result.totalRevenue),
      };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Failed to generate report');
    }
  }
}
