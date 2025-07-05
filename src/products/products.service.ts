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
import { AuditLogRepository } from 'src/audit-log/repositories/audit-log.repository';

@Injectable()
export class ProductsService {
  constructor(
    private readonly ProductRepository: ProductRepository,
    private readonly GamesRepository: GamesRepository,
    private readonly AuditLogReporsitory: AuditLogRepository,
  ) {}

  //Admin stuff
  async createProduct(
    createProductDto: CreateProductDto,
    adminId: string,
  ): Promise<{
    success: boolean;
    message: string;
    data: NewlyCreatedProduct;
  }> {
    const availableGame = await this.GamesRepository.findGameById(
      createProductDto.gameId,
    );

    console.log(availableGame);

    if (!availableGame) {
      throw new NotFoundException('Game not found');
    }

    const product =
      await this.ProductRepository.createProduct(createProductDto);

    if (!product) {
      throw new InternalServerErrorException('Product failed to create');
    }

    await this.AuditLogReporsitory.createLog(
      adminId,
      `Created new products for game ${availableGame.name}`,
    );

    return {
      success: true,
      message: 'Product created successfully',
      data: product,
    };
  }

  async getProductIndividually(): Promise<{
    success: true;
    message: string;
    data: ProductsList;
  }> {
    const products = await this.ProductRepository.getAllProductsIndividually();

    return {
      success: true,
      message: 'Product list fetched successfully',
      data: {
        products,
      },
    };
  }

  async updateProduct(
    updateProductData: updateProductDto,
    productIds: string,
    adminId: string,
  ): Promise<{
    success: boolean;
    message: string;
    data: Partial<Products>;
  }> {
    const existingProduct =
      await this.ProductRepository.findProductById(productIds);

    if (!existingProduct) {
      throw new NotFoundException('Product not found');
    }

    const productIdsToChange = [productIds];

    const updatedProduct = await this.ProductRepository.updateProduct(
      updateProductData,
      productIdsToChange,
    );

    if (!updatedProduct) {
      throw new InternalServerErrorException('Failed to update product');
    }

    await this.AuditLogReporsitory.createLog(
      adminId,
      `Updated product ${existingProduct.code}`,
    );

    return {
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct,
    };
  }

  async deleteProduct(
    productId: string,
    adminId: string, // tambah ini
  ): Promise<{ success: boolean; message: string; data: Partial<Products> }> {
    const existingProduct =
      await this.ProductRepository.findProductById(productId);

    if (!existingProduct) {
      throw new NotFoundException('Product not found');
    }

    const result = await this.ProductRepository.deleteProduct(productId);

    if (!result) {
      throw new InternalServerErrorException('Failed to delete product');
    }

    await this.AuditLogReporsitory.createLog(
      adminId,
      `Deleted product ${existingProduct.code}`,
    );

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
    const products = await this.ProductRepository.getAllProducts();

    return {
      success: true,
      message: 'Product list fetched successfully',
      data: {
        products,
      },
    };
  }

  async recoveryProducts(orderId: string): Promise<{
    success: boolean;
    message: string;
    data?: string[];
  }> {
    const result = await this.ProductRepository.productRecovery(orderId);
    console.log(result);
    return {
      success: true,
      message: 'Products recovered successfully',
      data: result,
    };
  }
}
