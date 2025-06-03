import { IsInt, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class OrderDto {
  @IsUUID()
  gameId: string;

  @IsOptional()
  @IsString()
  target?: string;

  @IsInt()
  value: number;

  @IsNumber()
  quantity: number;
}
