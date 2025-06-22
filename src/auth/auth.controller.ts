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
import { AuthGuard } from './auth.guard';
import { RequestWithUser } from './interfaces';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 300000 } }) // 5 login per 5 menit
  signIn(@Body() credentials: LoginDto) {
    return this.authService.login(credentials);
  }

  @UseGuards(AuthGuard)
  @Get('me')
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 per menit untuk profile
  getProfile(@Request() req: RequestWithUser) {
    return req.user;
  }

  @Post('register')
  @Throttle({ default: { limit: 3, ttl: 600000 } }) // 3 register per 10 menit
  register(@Body() user: RegisterDto) {
    return this.authService.register(user);
  }
}
