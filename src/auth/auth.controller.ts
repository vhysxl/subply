import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from 'interfaces/user.interface';
import { AuthGuard } from './auth.guard';
import { RequestWithUser } from './interfaces';

//add auth guard later
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() credentials: User) {
    return this.authService.login(credentials);
  }

  @UseGuards(AuthGuard)
  @Get('me')
  getProfile(@Request() req: RequestWithUser) {
    return req.user;
  }

  @Post('register')
  register(@Body() user: User) {
    return this.authService.register(user);
  }
}
