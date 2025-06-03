import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { NewlyCreatedProduct, Products, ProductsList } from './interface';
import { ProductRepository } from './repositories/product.repositories';
import { CreateProductDto } from './dto/create-products.dto';
import { updateProductDto } from './dto/update-products.dto';
import { GamesRepository } from 'src/games/repositories/games.repositories';

@Injectable()
export class ProductsService {
  constructor(
    private readonly ProductRepository: ProductRepository,
    private readonly GamesRepository: GamesRepository,
  ) {}

  //Admin stuff
  async createProduct(createProductDto: CreateProductDto): Promise<{
    success: boolean;
    message: string;
    data: NewlyCreatedProduct;
  }> {
    const availableGame = await this.GamesRepository.findGameById(
      createProductDto.gameId,
    );

    if (!availableGame) {
      throw new NotFoundException('Game not found');
    }

    const product =
      await this.ProductRepository.createProduct(createProductDto);

    if (!product) {
      throw new InternalServerErrorException('Product failed to create');
    }

    return {
      success: true,
      message: 'Product created successfully',
      data: product,
    };
  }

  async updateProduct(
    updateProductData: updateProductDto,
    productId: string,
  ): Promise<{
    success: boolean;
    message: string;
    data: Partial<Products>;
  }> {
    const existingProduct =
      await this.ProductRepository.findProductById(productId);

    if (!existingProduct) {
      throw new NotFoundException('Product not found');
    }

    const updatedProduct = await this.ProductRepository.updateProduct(
      updateProductData,
      productId,
    );

    if (!updatedProduct) {
      throw new InternalServerErrorException('Failed to update product');
    }

    return {
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct,
    };
  }

  async deleteProduct(
    productId: string,
  ): Promise<{ success: boolean; message: string; data: Partial<Products> }> {
    const result = await this.ProductRepository.deleteProduct(productId);

    if (!result) {
      throw new InternalServerErrorException('Failed to delete product');
    }

    return {
      success: true,
      message: 'Product deleted successfully',
      data: result,
    };
  }

  //User stuff
  async findAllProducts(): Promise<{
    success: boolean;
    message: string;
    data: ProductsList;
  }> {
    const products = await this.ProductRepository.getAllProducts(); // vouchers: Voucher[]

    if (products.length === 0) {
      throw new NotFoundException('Products not found');
    }

    return {
      success: true,
      message: 'Product list fetched successfully',
      data: {
        products,
      },
    };
  }

  // findOne(id: number) {
  //   return `This action returns a #${id} product`;
  // }
}
