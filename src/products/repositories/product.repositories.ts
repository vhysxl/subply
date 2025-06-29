import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { DATABASE_CONNECTION } from 'src/database/database-connection';
import * as schemas from 'schemas/tables';
import { eq, count, and, inArray } from 'drizzle-orm';
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
        .select({
          productId: schemas.productsTable.productId,
          code: schemas.productsTable.code,
          value: schemas.productsTable.value,
          status: schemas.productsTable.status,
          type: schemas.productsTable.type,
          price: schemas.productsTable.price,
          gameId: schemas.productsTable.gameId,
          createdAt: schemas.productsTable.createdAt,
          updatedAt: schemas.productsTable.updatedAt,

          gameName: schemas.games.name,
        })
        .from(schemas.productsTable)
        .innerJoin(
          schemas.games,
          eq(schemas.productsTable.gameId, schemas.games.gameId),
        )
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
          currency: schemas.games.currency,
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

      const data: Partial<Products>[] = rawData.map((item) => {
        const product = {
          type: item.type,
          value: Number(item.value),
          price: Number(item.price),
          gameId: item.gameId,
          gameName: item.gameName,
          isPopular: item.isPopular,
          currency: item.currency,
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
      const [result] = await this.db
        .delete(schemas.productsTable)
        .where(eq(schemas.productsTable.productId, productId))
        .returning();

      if (!result) {
        throw new NotFoundException(`Product with ID "${productId}" not found`);
      }

      const { value, price, ...rest } = result;
      const convertedResult = {
        ...rest,
        value: Number(value),
        price: Number(price),
      };

      return convertedResult;
    } catch (error) {
      console.error('Error deleting product:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error deleting product');
    }
  }

  async findProductById(productId: string) {
    try {
      const [product] = await this.db
        .select()
        .from(schemas.productsTable)
        .where(eq(schemas.productsTable.productId, productId));

      if (!product) {
        throw new NotFoundException(`Product with ID "${productId}" not found`);
      }

      return product;
    } catch (error) {
      console.error('Error finding product by ID:', error);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (error.code === '22P02') {
        throw new NotFoundException(`Product with ID "${productId}" not found`);
      }
      throw new InternalServerErrorException('Error finding product by ID');
    }
  }

  async updateProduct(
    updateProductData: Partial<Products>,
    productIds: string[],
  ) {
    try {
      const { value, price } = updateProductData;

      const preparedData = {
        ...updateProductData,
        value: value !== undefined ? String(value) : undefined,
        price: price !== undefined ? String(price) : undefined,
      };

      const [result] = await this.db
        .update(schemas.productsTable)
        .set(preparedData)
        .where(inArray(schemas.productsTable.productId, productIds))
        .returning();

      const { value: val, price: prc, ...rest } = result;

      const convertedResult = {
        ...rest,
        value: Number(val),
        price: Number(prc),
      };

      return convertedResult;
    } catch (error) {
      console.error('Error updating product:', error);
      throw new InternalServerErrorException('Error updating product woi');
    }
  }

  //for admin
  async getAllProductsIndividually() {
    try {
      const data = await this.db
        .select({
          productId: schemas.productsTable.productId,
          type: schemas.productsTable.type,
          value: schemas.productsTable.value,
          price: schemas.productsTable.price,
          gameId: schemas.productsTable.gameId,
          status: schemas.productsTable.status,
          code: schemas.productsTable.code,
          gameName: schemas.games.name,
          currency: schemas.games.currency,
        })
        .from(schemas.productsTable)
        .innerJoin(
          schemas.games,
          eq(schemas.productsTable.gameId, schemas.games.gameId),
        )
        .orderBy(schemas.productsTable.value);

      if (data.length === 0) {
        return [];
      }

      const sanitizedData: Partial<Products>[] = data.map((item) => {
        const product = {
          productId: item.productId,
          type: item.type,
          value: Number(item.value),
          price: Number(item.price),
          gameId: item.gameId,
          gameName: item.gameName,
          currency: item.currency,
          code: item.code,
          status: item.status,
        };

        return product;
      });

      return sanitizedData;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw new InternalServerErrorException('Error fetching products');
    }
  }
}
