import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class GetAllOrderDto {
  @IsInt()
  @Type(() => Number) // Merubah string ke number
  @Min(1)
  page: number = 1;
}
