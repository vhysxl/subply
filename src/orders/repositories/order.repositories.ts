import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { DATABASE_CONNECTION } from 'src/database/database-connection';
import * as schemas from 'schemas/tables';
import { Order, orderRequest } from '../interface';
import { and, desc, eq, getTableColumns, gte, inArray, sql } from 'drizzle-orm';
import { today } from 'src/common/constants/today.date';

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
      //pake trx biar atomic
      const order = await this.db.transaction(async (trx) => {
        //cek ketersediaan voucher
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

        //throw kalo voucher kurang
        if (availableVouchers.length < quantity) {
          throw new NotFoundException(
            `Only ${availableVouchers.length} vouchers available, but ${quantity} requested`,
          );
        }

        // ambil data voucher pertama jadi patokan data
        const firstVoucher = availableVouchers[0];
        const totalPrice = Number(firstVoucher.product.price) * quantity;
        const productIds = availableVouchers.map((v) => v.product.productId);

        //bikin order
        const [newOrder] = await trx
          .insert(schemas.ordersTable)
          .values({
            userId: userId,
            customerName: customerName,
            email: email,
            value: firstVoucher.product.value,
            priceTotal: String(totalPrice),
            type: firstVoucher.product.type,
            status: 'pending',
            target: '',
            gameName: firstVoucher.gameName,
          })
          .returning();

        //insert produk dan order ke table junction
        const orderProducts = await trx
          .insert(schemas.orderProductsTable)
          .values(
            availableVouchers.map((voucher) => ({
              orderId: newOrder.orderId,
              productId: voucher.product.productId,
              quantity: 1,
            })),
          )
          .returning();

        //set status voucher yang dipake ke used
        await trx
          .update(schemas.productsTable)
          .set({
            status: 'used',
            updatedAt: new Date(),
          })
          .where(inArray(schemas.productsTable.productId, productIds));

        //casting tipe data
        const order: Order = {
          ...newOrder,
          value: Number(newOrder.value),
          priceTotal: Number(newOrder.priceTotal),
          productsOrder: orderProducts,
          quantity: orderProducts.reduce((sum, item) => sum + item.quantity, 0),
        };

        return order;
      });

      return order;
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
        //cari produk (takutnya produk goib)
        const [availableProduct] = await trx
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

        //throw error kalo goib
        if (!availableProduct) {
          throw new NotFoundException('No available topup option');
        }

        const totalPrice = Number(availableProduct.product.price) * quantity;

        //buat order baru
        const [newOrder] = await trx
          .insert(schemas.ordersTable)
          .values({
            userId: userId,
            customerName: customerName,
            email: email,
            value: availableProduct.product.value,
            priceTotal: String(totalPrice),
            type: availableProduct.product.type,
            status: 'pending',
            target: target,
            gameName: availableProduct.gameName,
          })
          .returning();

        // insert ke junction table
        const orderProducts = await trx
          .insert(schemas.orderProductsTable)
          .values({
            orderId: newOrder.orderId,
            productId: availableProduct.product.productId,
            quantity: quantity,
          })
          .returning();

        //casting
        const order: Order = {
          ...newOrder,
          priceTotal: Number(newOrder.priceTotal),
          value: Number(newOrder.value),
          productsOrder: orderProducts,
          quantity: orderProducts.reduce((sum, item) => sum + item.quantity, 0),
        };

        return order;
      });

      return order;
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

  async getOrdersByUser(userId: string) {
    try {
      const orders = await this.db.query.ordersTable.findMany({
        where: eq(schemas.ordersTable.userId, userId), // ✅ Fix: userId bukan orderId
        orderBy: [desc(schemas.ordersTable.createdAt)],
        with: {
          payment: {
            columns: {
              paymentLink: true,
            },
          },
          orderProducts: {
            with: {
              product: {
                columns: {
                  productId: true,
                  name: true,
                  price: true,
                },
              },
            },
          },
        },
      });

      const processedOrders = orders.map((order) => ({
        orderId: order.orderId,
        target: order.target,
        status: order.status,
        createdAt: order.createdAt,
        priceTotal: Number(order.priceTotal),
        value: Number(order.value),
        type: order.type,
        gameName: order.gameName,
        redirectLink: order.payment?.paymentLink || null, // ✅ Fix: akses paymentLink
        productsOrder: order.orderProducts,
        quantity: order.orderProducts.reduce((sum, op) => sum + op.quantity, 0),
      }));

      return processedOrders;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Failed to fetch orders');
    }
  }

  async getOrderDetails(orderId: string, userId: string) {
    try {
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

      let productIds;

      if (orderResult.type === 'topup') {
        productIds = [orderResult.productIds];
      } else {
        try {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          productIds = JSON.parse(orderResult.productIds);
        } catch (e) {
          console.error('Invalid productIds JSON:', e);
          productIds = [];
        }
      }

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

  async getAllOrders(page: number = 1, limit: number = 20) {
    try {
      const offset = (page - 1) * limit;
      const orders = await this.db
        .select({
          ...getTableColumns(schemas.ordersTable),
          paymentStatus: schemas.paymentsTable.status,
        })
        .from(schemas.ordersTable)
        .leftJoin(
          schemas.paymentsTable,
          eq(schemas.ordersTable.orderId, schemas.paymentsTable.orderId),
        )
        .limit(limit)
        .offset(offset)
        .orderBy(desc(schemas.ordersTable.createdAt));

      return orders.map((order) => ({
        ...order,
        value: Number(order.value),
        priceTotal: Number(order.priceTotal),
        quantity: Number(order.quantity),
      }));
    } catch (error) {
      console.error('Error fetching all orders:', error);
      throw new InternalServerErrorException('Error fetching all orders');
    }
  }

  async newOrdersToday() {
    try {
      const [{ count }] = await this.db
        .select({ count: sql`COUNT(*)`.as('count') })
        .from(schemas.ordersTable)
        .where(gte(schemas.ordersTable.createdAt, today));

      return Number(count);
    } catch (error) {
      console.error('Error fetching new orders today:', error);
      throw new InternalServerErrorException('Error fetching new orders today');
    }
  }

  async getDailyCompletedRevenue() {
    try {
      const [{ total }] = await this.db
        .select({
          total: sql`COALESCE(SUM(price_total), 0)`.as('total'),
        })
        .from(schemas.ordersTable)
        .where(
          and(
            eq(schemas.ordersTable.status, 'completed'),
            gte(schemas.ordersTable.createdAt, today),
          ),
        );

      return Number(total);
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Failed to sum completed revenue');
    }
  }
}
