import { IsEnum, IsNumber, IsString } from 'class-validator';

export enum ProductType {
  TOPUP = 'topup',
  Voucher = 'voucher',
}

export class CreateProductDto {
  @IsString()
  code: string;

  @IsNumber()
  value: number;

  @IsNumber()
  price: number;

  @IsString()
  gameId: string;

  @IsEnum(ProductType)
  type: ProductType;
}
