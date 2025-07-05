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
import { SearchUserDto } from './dto/search-dto';
import { GetUserId } from 'src/common/decorator/user.decorator';
import { ChangePwDto } from './dto/change-pw.dto';

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

  @Get('/search')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.superadmin, Role.admin)
  findOneByName(@Query() data: SearchUserDto) {
    console.log(data);
    return this.usersService.searchUserByName(data.name);
  }

  @Patch('/password/:userId')
  @UseGuards(AuthGuard)
  changePassword(@Param('userId') userId: string, @Body() data: ChangePwDto) {
    return this.usersService.changePassword(
      userId,
      data.newPassword,
      data.oldPassword,
    );
  }

  @Patch('/admin/:userId')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.superadmin)
  updateUserAdmin(
    @Param('userId') userId: string,
    @Body() updateUserDto: updateUserDto,
    @GetUserId() adminId: string,
  ) {
    return this.usersService.updateUser(updateUserDto, userId, adminId);
  }

  @Patch(':userId')
  @UseGuards(AuthGuard)
  updateUser(
    @Param('userId') userId: string,
    @Body() updateUserDto: updateUserDto,
  ) {
    return this.usersService.updateUser(updateUserDto, userId);
  }

  @Delete(':userId')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.superadmin)
  deleteUser(@Param('userId') userId: string, @GetUserId() adminId: string) {
    return this.usersService.deleteUser(userId, adminId);
  }

  @Get(':userId')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.superadmin, Role.admin)
  findOne(@Param('userId') userId: string) {
    return this.usersService.findOneUser(userId);
  }
}
