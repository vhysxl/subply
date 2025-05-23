import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { DATABASE_CONNECTION } from 'src/database/database-connection';
import * as schemas from 'schemas/index';
import { orderRequest } from '../interface';
import { and, eq } from 'drizzle-orm';

@Injectable()
export class OrderRepository {
  constructor(
    @Inject(DATABASE_CONNECTION) private db: NeonDatabase<typeof schemas>,
  ) {}

  async createVoucherOrder({
    userId,
    gameId,
    value,
    type,
    customerName,
    email,
    quantity,
  }: orderRequest) {
    try {
      const order = await this.db.transaction(async (trx) => {
        const [voucherWithGame] = await trx
          .select({
            product: schemas.productsTable,
            gameName: schemas.games.name,
          })
          .from(schemas.productsTable)
          .innerJoin(
            schemas.games,
            eq(schemas.productsTable.gameId, schemas.games.gameId),
          )
          .where(
            and(
              eq(schemas.productsTable.status, 'available'),
              eq(schemas.productsTable.type, type),
              eq(schemas.productsTable.gameId, gameId),
              eq(schemas.productsTable.value, String(value)),
            ),
          )
          .limit(1);

        if (!voucherWithGame) {
          throw new NotFoundException('No available vouchers found');
        }

        const totalPrice = Number(voucherWithGame.product.price) * quantity;

        const [newOrder] = await trx
          .insert(schemas.ordersTable)
          .values({
            userId: userId,
            customerName: customerName,
            email: email,
            productId: voucherWithGame.product.productId,
            value: voucherWithGame.product.value,
            priceTotal: String(totalPrice),
            type: voucherWithGame.product.type,
            status: 'pending',
            target: '',
            quantity: String(quantity),
            gameName: voucherWithGame.gameName,
          })
          .returning();

        await trx
          .update(schemas.productsTable)
          .set({
            status: 'used',
            updatedAt: new Date(),
          })
          .where(
            eq(
              schemas.productsTable.productId,
              voucherWithGame.product.productId,
            ),
          );

        return newOrder;
      });

      return {
        ...order,
        value: Number(order.value),
        priceTotal: Number(order.priceTotal),
        quantity: Number(order.quantity),
      };
    } catch (error) {
      console.error('Error creating quick order:', error);
      throw new InternalServerErrorException(
        'Failed to create order, please try again later',
      );
    }
  }

  async createDirectTopup({
    userId,
    gameId,
    value,
    type,
    customerName,
    email,
    target,
    quantity,
  }: orderRequest) {
    try {
      const order = await this.db.transaction(async (trx) => {
        const [topupWithGame] = await trx
          .select({
            product: schemas.productsTable,
            gameName: schemas.games.name,
          })
          .from(schemas.productsTable)
          .innerJoin(
            schemas.games,
            eq(schemas.productsTable.gameId, schemas.games.gameId),
          )
          .where(
            and(
              eq(schemas.productsTable.status, 'available'),
              eq(schemas.productsTable.type, type),
              eq(schemas.productsTable.gameId, gameId),
              eq(schemas.productsTable.value, String(value)),
            ),
          )
          .limit(1);

        if (!topupWithGame) {
          throw new NotFoundException('No available topup option');
        }

        const totalPrice = Number(topupWithGame.product.price) * quantity;

        const [newOrder] = await trx
          .insert(schemas.ordersTable)
          .values({
            userId: userId,
            customerName: customerName,
            email: email,
            productId: topupWithGame.product.productId,
            value: topupWithGame.product.value,
            priceTotal: String(totalPrice),
            type: topupWithGame.product.type,
            status: 'pending',
            target: target,
            quantity: String(quantity),
            gameName: topupWithGame.gameName,
          })
          .returning();

        return newOrder;
      });

      return {
        ...order,
        value: Number(order.value),
        priceTotal: Number(order.priceTotal),
        quantity: Number(order.quantity),
      };
    } catch (error) {
      console.error('Error creating quick order:', error);
      throw new InternalServerErrorException(
        'Failed to create order, please try again later',
      );
    }
  }

  async fallbackDeleteOrder(
    orderId: string,
    voucherId: string,
    type: 'topup' | 'voucher',
  ) {
    try {
      await this.db.transaction(async (trx) => {
        await trx
          .delete(schemas.ordersTable)
          .where(eq(schemas.ordersTable.productId, orderId));

        if (type === 'voucher') {
          await trx
            .update(schemas.productsTable)
            .set({
              status: 'available',
              updatedAt: new Date(),
            })
            .where(eq(schemas.productsTable.productId, voucherId));
        }
      });
    } catch (error) {
      console.error('Error deleting order:', error);
    }
  }

  async getOrdersByUser(
    userId: string,
    status: 'pending' | 'completed' | 'cancelled' | 'processed',
  ) {
    try {
      if (status === 'pending') {
        const orders = await this.db
          .select({
            orderId: schemas.ordersTable.orderId,
            target: schemas.ordersTable.target,
            status: schemas.ordersTable.status,
            createdAt: schemas.ordersTable.createdAt,
            priceTotal: schemas.ordersTable.priceTotal,
            value: schemas.ordersTable.value,
            type: schemas.ordersTable.type,
            gameName: schemas.ordersTable.gameName,
            quantity: schemas.ordersTable.quantity,
            redirectLink: schemas.paymentsTable.paymentLink,
          })
          .from(schemas.ordersTable)
          .leftJoin(
            schemas.paymentsTable,
            eq(schemas.ordersTable.orderId, schemas.paymentsTable.orderId),
          )
          .where(
            and(
              eq(schemas.ordersTable.userId, userId),
              eq(schemas.ordersTable.status, status),
            ),
          );

        return orders.map((order) => ({
          ...order,
          value: Number(order.value),
          priceTotal: Number(order.priceTotal),
          quantity: Number(order.quantity),
        }));
      } else {
        const orders = await this.db
          .select({
            orderId: schemas.ordersTable.orderId,
            target: schemas.ordersTable.target,
            status: schemas.ordersTable.status,
            createdAt: schemas.ordersTable.createdAt,
            priceTotal: schemas.ordersTable.priceTotal,
            value: schemas.ordersTable.value,
            type: schemas.ordersTable.type,
            gameName: schemas.ordersTable.gameName,
            quantity: schemas.ordersTable.quantity,
          })
          .from(schemas.ordersTable)
          .where(
            and(
              eq(schemas.ordersTable.userId, userId),
              eq(schemas.ordersTable.status, status),
            ),
          );

        return orders.map((order) => ({
          ...order,
          value: Number(order.value),
          priceTotal: Number(order.priceTotal),
          quantity: Number(order.quantity),
        }));
      }
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Failed to fetch orders');
    }
  }

  async getOrderDetails(orderId: string, email: string) {
    try {
      const [result] = await this.db
        .select({
          orderId: schemas.ordersTable.orderId,
          target: schemas.ordersTable.target,
          status: schemas.ordersTable.status,
          createdAt: schemas.ordersTable.createdAt,
          priceTotal: schemas.ordersTable.priceTotal,
          value: schemas.ordersTable.value,
          type: schemas.ordersTable.type,
          gameName: schemas.ordersTable.gameName,
          quantity: schemas.ordersTable.quantity,
          email: schemas.ordersTable.email,
          paymentLink: schemas.paymentsTable.paymentLink,
          voucherCode: schemas.productsTable.code,
        })
        .from(schemas.ordersTable)
        .leftJoin(
          schemas.paymentsTable,
          eq(schemas.ordersTable.orderId, schemas.paymentsTable.orderId),
        )
        .leftJoin(
          schemas.productsTable,
          eq(schemas.ordersTable.productId, schemas.productsTable.productId),
        )
        .where(
          and(
            eq(schemas.ordersTable.orderId, orderId),
            eq(schemas.ordersTable.email, email),
          ),
        );

      console.log(result);

      const baseResult = {
        ...result,
        priceTotal: Number(result.priceTotal),
        value: Number(result.value),
        quantity: Number(result.quantity),
      };

      return {
        ...baseResult,
        paymentLink:
          result.status === 'completed' && result.type === 'voucher'
            ? null
            : result.paymentLink,
        voucherCode:
          result.status === 'completed' && result.type === 'voucher'
            ? result.voucherCode
            : result.status === 'pending' && result.type === 'voucher'
              ? result.voucherCode
              : null,
      };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Failed to fetch order details');
    }
  }
}
