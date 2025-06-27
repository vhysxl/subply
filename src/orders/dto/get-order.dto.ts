import { IsUUID } from 'class-validator';

export class GetOrderDto {
  @IsUUID()
  userId: string;
}
