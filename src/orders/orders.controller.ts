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
  Patch,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrderDto } from './dto/create-order.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { GetOrderDto } from './dto/get-order.dto';
import { RequestWithUser } from 'src/auth/interfaces';
import { UpdateOrderStatusDto } from './dto/update-order.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @UseGuards(AuthGuard)
  @Post('order')
  createOrder(@Body() OrderData: OrderDto, @Request() req: RequestWithUser) {
    const userId = req.user?.sub;
    if (!userId) throw new BadRequestException('Invalid request');
    return this.ordersService.createOrder(OrderData, userId);
  }

  @UseGuards(AuthGuard)
  @Get()
  getOrders(@Query() query: GetOrderDto) {
    return this.ordersService.findOrdersByUser(query);
  }

  @UseGuards(AuthGuard)
  @Get(':orderId/details')
  getOrderDetails(
    @Param('orderId') orderId: string,
    @Request() req: RequestWithUser,
  ) {
    const userId = req.user?.sub;
    if (!userId)
      throw new BadRequestException('Invalid request for order details');

    return this.ordersService.getOrderDetails(orderId, userId);
  }

  @Patch(':orderId/cancel')
  cancelOrder(@Param('orderId') orderId: string) {
    return this.ordersService.cancelOrder(orderId);
  }

  //admin stuff
  @Patch(':orderId/update')
  updateOrderStatus(
    @Param('orderId') orderId: string,
    @Body() updateData: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateOrderStatus(orderId, updateData.status);
  }
}
