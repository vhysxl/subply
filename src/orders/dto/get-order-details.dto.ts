import { IsString } from 'class-validator';

export class GetOrderDetailsDto {
  @IsString()
  orderId: string;
}
