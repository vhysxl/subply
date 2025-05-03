import {
  IsEmail,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export enum OrderType {
  TOPUP = 'topup',
  VOUCHER = 'voucher',
}

export class OrderDto {
  @IsUUID()
  userId: string;

  @IsEmail()
  email: string;

  @IsUUID()
  gameId: string;

  @IsOptional()
  @IsString()
  target?: string;

  @IsInt()
  value: number;

  @IsEnum(OrderType)
  type: OrderType;

  @IsString()
  gameName: string;

  @IsString()
  customerName: string;

  @IsNumber()
  quantity: number;
}
