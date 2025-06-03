import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { GetUserDto } from './dto/get-user.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Role } from 'src/common/constants/role.enum';
import { Roles } from 'src/common/decorator/role.decorator';
import { updateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.admin, Role.superadmin)
  findAll(@Query() query: GetUserDto) {
    const { page } = query;
    const limit = 5;

    return this.usersService.findAllUsers(page, limit);
  }

  @Patch(':userId')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.superadmin)
  updateUser(
    @Param('userId') userId: string,
    @Body() updateUserDto: updateUserDto,
  ) {
    return this.usersService.updateUser(updateUserDto, userId);
  }

  @Delete(':userId')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.superadmin)
  deleteUser(@Param('userId') userId: string) {
    return this.usersService.deleteUser(userId);
  }
}
