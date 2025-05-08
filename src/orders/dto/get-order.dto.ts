import { IsEnum, IsUUID } from 'class-validator';

export enum OrderStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  PROCESSED = 'processed',
}

export class GetOrderDto {
  @IsUUID()
  userId: string;

  @IsEnum(OrderStatus)
  status: OrderStatus;
}
