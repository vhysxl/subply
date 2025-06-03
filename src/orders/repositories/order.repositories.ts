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
import { and, eq, inArray, sql } from 'drizzle-orm';

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
        const availableVouchers = await trx
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
          .limit(quantity);

        if (availableVouchers.length < quantity) {
          throw new NotFoundException(
            `Only ${availableVouchers.length} vouchers available, but ${quantity} requested`,
          );
        }

        const totalPrice =
          Number(availableVouchers[0].product.price) * quantity;
        const productIds = availableVouchers.map((v) => v.product.productId);

        const [newOrder] = await trx
          .insert(schemas.ordersTable)
          .values({
            userId: userId,
            customerName: customerName,
            email: email,
            productIds: JSON.stringify(productIds),
            value: availableVouchers[0].product.value,
            priceTotal: String(totalPrice),
            type: availableVouchers[0].product.type,
            status: 'pending',
            target: '',
            quantity: String(quantity),
            gameName: availableVouchers[0].gameName,
          })
          .returning();

        await trx
          .update(schemas.productsTable)
          .set({
            status: 'used',
            updatedAt: new Date(),
          })
          .where(inArray(schemas.productsTable.productId, productIds));

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

      if (error instanceof NotFoundException) throw error;
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
            productIds: topupWithGame.product.productId,
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

      if (error instanceof NotFoundException) throw error;

      throw new InternalServerErrorException(
        'Failed to create order, please try again later',
      );
    }
  }

  async fallbackDeleteOrder(
    orderId: string,
    voucherIds: string[],
    type: 'topup' | 'voucher',
  ) {
    try {
      await this.db.transaction(async (trx) => {
        await trx
          .delete(schemas.ordersTable)
          .where(eq(schemas.ordersTable.orderId, orderId));

        if (type === 'voucher') {
          await trx
            .update(schemas.productsTable)
            .set({
              status: 'available',
              updatedAt: new Date(),
            })
            .where(inArray(schemas.productsTable.productId, voucherIds));
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

  async getOrderDetails(orderId: string, userId: string) {
    try {
      // Pertama ambil order untuk dapat productIds
      const [orderResult] = await this.db
        .select()
        .from(schemas.ordersTable)
        .where(
          and(
            eq(schemas.ordersTable.orderId, orderId),
            eq(schemas.ordersTable.userId, userId),
          ),
        );

      if (!orderResult) {
        throw new NotFoundException('Order not found');
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const productIds = JSON.parse(orderResult.productIds);

      // Kemudian ambil detail dengan products
      const [result] = await this.db
        .select({
          orderId: schemas.ordersTable.orderId,
          userId: schemas.ordersTable.userId,
          target: schemas.ordersTable.target,
          status: schemas.ordersTable.status,
          createdAt: schemas.ordersTable.createdAt,
          priceTotal: schemas.ordersTable.priceTotal,
          value: schemas.ordersTable.value,
          type: schemas.ordersTable.type,
          gameName: schemas.ordersTable.gameName,
          quantity: schemas.ordersTable.quantity,
          paymentLink: schemas.paymentsTable.paymentLink,
          voucherCodes: sql<string[]>`array_agg(${schemas.productsTable.code})`,
        })
        .from(schemas.ordersTable)
        .leftJoin(
          schemas.paymentsTable,
          eq(schemas.ordersTable.orderId, schemas.paymentsTable.orderId),
        )
        .leftJoin(
          schemas.productsTable,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          inArray(schemas.productsTable.productId, productIds),
        )
        .where(eq(schemas.ordersTable.orderId, orderId))
        .groupBy(
          schemas.ordersTable.orderId,
          schemas.paymentsTable.paymentLink,
        );

      if (!result) {
        throw new NotFoundException('Order not found');
      }

      const baseResult = {
        ...result,
        priceTotal: Number(result.priceTotal),
        value: Number(result.value),
        quantity: Number(result.quantity),
      };

      const { voucherCodes, ...rest } = baseResult;

      if (baseResult.type === 'voucher' && baseResult.status === 'completed') {
        return {
          ...rest,
          paymentLink:
            result.status === 'completed' ||
            result.status === 'processed' ||
            result.status === 'cancelled'
              ? null
              : result.paymentLink,
          voucherCodes,
        };
      }

      return {
        ...rest,
        paymentLink:
          result.status === 'completed' ||
          result.status === 'processed' ||
          result.status === 'cancelled'
            ? null
            : result.paymentLink,
      };
    } catch (error) {
      console.error(error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch order details');
    }
  }

  async updateOrderStatus(
    orderId: string,
    status: 'pending' | 'completed' | 'cancelled' | 'processed' | 'failed',
  ) {
    try {
      const [updatedOrder] = await this.db
        .update(schemas.ordersTable)
        .set({
          status: status,
        })
        .where(eq(schemas.ordersTable.orderId, orderId))
        .returning();

      if (!updatedOrder) {
        throw new NotFoundException('Order not found');
      }

      const { value, priceTotal, quantity } = updatedOrder;

      const convertedOrder = {
        ...updatedOrder,
        value: Number(value),
        priceTotal: Number(priceTotal),
        quantity: Number(quantity),
      };

      return convertedOrder;
    } catch (error) {
      console.error('Error updating order status:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (error.code === '22P02') {
        throw new NotFoundException('Order not found');
      }

      throw new InternalServerErrorException(
        'Failed to update order status, please try again later',
      );
    }
  }

  async cancelOder(orderId: string) {
    try {
      const [result] = await this.db
        .update(schemas.ordersTable)
        .set({ status: 'cancelled' })
        .where(eq(schemas.ordersTable.orderId, orderId))
        .returning();

      console.log(result);

      if (!result) {
        throw new NotFoundException('Orders not found');
      }

      const { value, quantity, priceTotal } = result;

      const convertedResult = {
        ...result,
        value: Number(value),
        quantity: Number(quantity),
        priceTotal: Number(priceTotal),
      };

      return convertedResult;
    } catch (error) {
      console.error(error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to cancel order, Please try again later',
      );
    }
  }
}
