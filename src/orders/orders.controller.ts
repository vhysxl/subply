import {
  Body,
  Controller,
  Post,
  UseGuards,
  Get,
  Query,
  Param,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrderDto } from './dto/create-order.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { GetOrderDto } from './dto/get-order.dto';
import { RequestWithUser } from 'src/auth/interfaces';
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // @UseGuards(AuthGuard)
  @Post('order')
  createOrder(@Body() OrderData: OrderDto) {
    return this.ordersService.createOrder(OrderData);
  }

  @UseGuards(AuthGuard)
  @Get()
  getOrders(@Query() query: GetOrderDto) {
    return this.ordersService.findOrdersByUser(query);
  }

  @UseGuards(AuthGuard)
  @Get(':orderId/details')
  getOrderById(
    @Param('orderId') orderId: string,
    @Request() req: RequestWithUser,
  ) {
    const email = req.user?.email;
    if (!email)
      throw new BadRequestException('Invalid request for order details');

    return this.ordersService.getOrderDetails(orderId, email);
  }
}
