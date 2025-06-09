import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { Roles } from 'src/common/decorator/role.decorator';
import { Role } from 'src/common/constants/role.enum';
import { CreateProductDto } from './dto/create-products.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { updateProductDto } from './dto/update-products.dto';
import { GetUserId } from 'src/common/decorator/user.decorator';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.admin, Role.superadmin)
  create(
    @Body() createProductDto: CreateProductDto,
    @GetUserId() adminId: string,
  ) {
    return this.productsService.createProduct(createProductDto, adminId);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.admin, Role.superadmin)
  remove(@Param('id') productId: string, @GetUserId() adminId: string) {
    return this.productsService.deleteProduct(productId, adminId);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.admin, Role.superadmin)
  update(
    @Param('id') productId: string,
    @Body() updateProductDto: updateProductDto,
    @GetUserId() adminId: string,
  ) {
    return this.productsService.updateProduct(
      updateProductDto,
      productId,
      adminId,
    );
  }

  @Get()
  findAll() {
    return this.productsService.findAllProducts();
  }
}
