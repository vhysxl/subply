import { Injectable, NotFoundException } from '@nestjs/common';
import { NewlyCreatedProduct, ProductsList } from './interface';
import { ProductRepository } from './repositories/product.repositories';
import { CreateProductDto } from './dto/create-products.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly ProductRepository: ProductRepository) {}

  //Admin stuff
  async createProduct(createProductDto: CreateProductDto): Promise<{
    success: boolean;
    message: string;
    data: NewlyCreatedProduct;
  }> {
    const product =
      await this.ProductRepository.createProduct(createProductDto);

    if (!product) {
      throw new NotFoundException('Product failed to create');
    }

    return {
      success: true,
      message: 'Product created successfully',
      data: product,
    };
  }

  async deleteProduct(
    productId: string,
  ): Promise<{ success: boolean; message: string }> {
    const result = await this.ProductRepository.deleteProduct(productId);

    if (!result) {
      throw new NotFoundException('Failed to delete product');
    }

    return {
      success: true,
      message: 'Product deleted successfully',
    };
  }

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

  // update(id: number, updateProductDto: UpdateProductDto) {
  //   return `This action updates a #${id} product`;
  // }
}
