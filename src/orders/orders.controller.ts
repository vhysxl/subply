import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrderDto } from './dto/create-order.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @UseGuards(AuthGuard)
  @Post('order')
  createOrder(@Body() OrderData: OrderDto) {
    return this.ordersService.createOrder(OrderData);
  }
}
