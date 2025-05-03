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

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() credentials: LoginDto) {
    return this.authService.login(credentials);
  }

  @UseGuards(AuthGuard)
  @Get('me')
  getProfile(@Request() req: RequestWithUser) {
    return req.user;
  }

  @Post('register')
  register(@Body() user: RegisterDto) {
    return this.authService.register(user);
  }
}
