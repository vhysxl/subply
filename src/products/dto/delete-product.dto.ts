import { IsString } from 'class-validator';

export class DeleteProductDto {
  @IsString()
  productId: string;
}
