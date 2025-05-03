import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductsList } from './interface';
import { ProductRepository } from './repositories/product.repositories';

@Injectable()
export class ProductsService {
  constructor(private readonly ProductRepository: ProductRepository) {}

  // create(createProductDto: CreateProductDto) {
  //   return 'This action adds a new product';
  // }

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

  // remove(id: number) {
  //   return `This action removes a #${id} product`;
  // }
}
