import { Injectable, NotFoundException } from '@nestjs/common';
import { VoucherList } from './interface';
import { ProductRepository } from './repositories/product.repositories';

@Injectable()
export class ProductsService {
  constructor(private readonly ProductRepository: ProductRepository) {}

  // create(createProductDto: CreateProductDto) {
  //   return 'This action adds a new product';
  // }

  async findVoucher(): Promise<{
    success: boolean;
    message: string;
    data: VoucherList;
  }> {
    const vouchers = await this.ProductRepository.getVoucher(); // vouchers: Voucher[]

    if (vouchers.length === 0) {
      throw new NotFoundException('Voucher not found');
    }

    console.log('vouchers', vouchers);

    return {
      success: true,
      message: 'Voucher list fetched successfully',
      data: {
        vouchers,
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
