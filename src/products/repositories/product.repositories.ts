import { Inject, Injectable } from '@nestjs/common';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { DATABASE_CONNECTION } from 'src/database/database-connection';
import * as schemas from 'schemas/index';
import { eq, count, and } from 'drizzle-orm';
import { Products } from '../interface';

@Injectable()
export class ProductRepository {
  constructor(
    @Inject(DATABASE_CONNECTION) private db: NeonDatabase<typeof schemas>,
  ) {}

  async getProductInfo(gameId: string, value: number) {
    try {
      const product = await this.db
        .select()
        .from(schemas.productsTable)
        .where(
          and(
            eq(schemas.productsTable.gameId, gameId),
            eq(schemas.productsTable.value, String(value)),
          ),
        )
        .limit(1);

      if (product.length === 0) {
        return null;
      }

      return {
        ...product[0],
        value: Number(product[0].value),
        price: Number(product[0].price),
      };
    } catch (error) {
      console.error('Error getting product info:', error);
      throw new Error('Failed to get product information');
    }
  }

  async getAllProducts() {
    try {
      const rawData = await this.db
        .select({
          type: schemas.productsTable.type,
          value: schemas.productsTable.value,
          price: schemas.productsTable.price,
          gameId: schemas.productsTable.gameId,
          gameName: schemas.games.name,
          stock: count(),
        })
        .from(schemas.productsTable)
        .innerJoin(
          schemas.games,
          eq(schemas.productsTable.gameId, schemas.games.gameId),
        )
        .where(eq(schemas.productsTable.status, 'available'))
        .groupBy(
          schemas.productsTable.value,
          schemas.productsTable.type,
          schemas.productsTable.price,
          schemas.productsTable.gameId,
          schemas.games.name,
        )
        .orderBy(schemas.productsTable.value);

      if (rawData.length === 0) {
        return [];
      }

      const data: Products[] = rawData.map((item) => {
        const product = {
          type: item.type,
          value: Number(item.value),
          price: Number(item.price),
          gameId: item.gameId,
          gameName: item.gameName,
        };

        if (item.type === 'voucher') {
          return {
            ...product,
            stock: item.stock,
          };
        }

        return product;
      });

      return data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw new Error('Error fetching products');
    }
  }
}
