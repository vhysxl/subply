import { Body, Controller, Post } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { QuickOrder } from './interface';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // authguard
  @Post('quick-order')
  createQuickOrder(@Body() quickOrderData: QuickOrder) {
    return this.ordersService.createQuickOrder(quickOrderData);
  }
}
