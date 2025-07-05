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
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Role } from 'src/common/constants/role.enum';
import { Roles } from 'src/common/decorator/role.decorator';
import { GetUserId } from 'src/common/decorator/user.decorator';
import { GetAllOrderDto } from './dto/get-all-order.dto';
import { Throttle } from '@nestjs/throttler';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @UseGuards(AuthGuard)
  @Throttle({ default: { limit: 3, ttl: 600000 } })
  @Post('order')
  createOrder(@Body() OrderData: OrderDto, @Request() req: RequestWithUser) {
    const userId = req.user?.sub;
    if (!userId) throw new BadRequestException('Invalid request');
    return this.ordersService.createOrder(OrderData, userId);
  }

  @UseGuards(AuthGuard)
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @Get()
  getOrders(@Query() query: GetOrderDto) {
    return this.ordersService.findOrdersByUser(query);
  }

  @Get('allorder')
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.admin, Role.superadmin)
  getAllOrders(@Query() query: GetAllOrderDto) {
    const { page } = query;
    const limit = 20;

    return this.ordersService.getAllOrders(page, limit);
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

  @UseGuards(AuthGuard)
  @Patch(':orderId/cancel')
  cancelOrder(
    @Param('orderId') orderId: string,
    @Request() req: RequestWithUser,
  ) {
    const userId = req.user?.sub;
    if (!userId)
      throw new BadRequestException('Invalid request for order details');
    return this.ordersService.cancelOrder(orderId, userId);
  }

  //admin stuff
  @Patch(':orderId/update')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.admin, Role.superadmin)
  updateOrderStatus(
    @Param('orderId') orderId: string,
    @Body() updateData: UpdateOrderStatusDto,
    @GetUserId() adminId: string,
  ) {
    return this.ordersService.updateOrderStatus(
      orderId,
      updateData.status,
      adminId,
    );
  }
}
