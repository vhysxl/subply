import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { DATABASE_CONNECTION } from 'src/database/database-connection';
import * as schemas from 'schemas/index';
import { eq, count, and } from 'drizzle-orm';
import { Products } from '../interface';
import { CreateProductDto } from '../dto/create-products.dto';

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
      throw new InternalServerErrorException(
        'Failed to get product information',
      );
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
          isPopular: schemas.games.isPopular,
          curreny: schemas.games.currency,
          imageUrl: schemas.games.imageUrl,
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
          schemas.games.isPopular,
          schemas.games.currency,
          schemas.games.imageUrl,
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
          isPopular: item.isPopular,
          currency: item.curreny,
          imageUrl: item.imageUrl,
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
      throw new InternalServerErrorException('Error fetching products');
    }
  }

  async createProduct(productData: CreateProductDto) {
    try {
      const { code, value, price, gameId, type } = productData;

      const gameExists = await this.db
        .select()
        .from(schemas.games)
        .where(eq(schemas.games.gameId, gameId));

      if (!gameExists.length) {
        new BadRequestException('Game ID not found');
      }

      const [product] = await this.db
        .insert(schemas.productsTable)
        .values({
          value: String(value),
          price: String(price),
          gameId,
          type: type,
          code: code || 'code not provided',
          status: 'available',
        })
        .returning();

      return {
        ...product,
        value: Number(product.value),
        price: Number(product.price),
      };
    } catch (error) {
      console.error('Error creating product:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      new InternalServerErrorException('Error creating product');
    }
  }

  async deleteProduct(productId: string) {
    try {
      const result = await this.db
        .delete(schemas.productsTable)
        .where(eq(schemas.productsTable.productId, productId))
        .returning();

      console.log(result);

      if (result.length === 0) {
        throw new NotFoundException('Product not found');
      }

      return true;
    } catch (error) {
      console.error('Error deleting product:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error deleting product');
    }
  }
}
