import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional } from 'class-validator';
import { CreateGameDto } from 'src/games/dto/create-game.dto';

export enum ProductStatus {
  AVAILABLE = 'available',
  USED = 'used',
}
export class updateProductDto extends PartialType(CreateGameDto) {
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;
}
