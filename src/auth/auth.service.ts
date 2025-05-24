import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

import { LoginCredentials, RegisterInterface, User } from './interfaces';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(
    credentials: LoginCredentials,
  ): Promise<{ token: string; user: Omit<User, 'password' | 'role'> }> {
    //ngecek user
    const user = await this.usersService.credentialsCheck(credentials);

    const payload = {
      sub: user.userId,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      roles: user.roles,
    };

    const sanitazedUser = {
      userId: user.userId,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };

    return {
      token: await this.jwtService.signAsync(payload),
      user: sanitazedUser,
    };
  }

  async register(
    credentials: RegisterInterface,
  ): Promise<{ success: boolean; message: string }> {
    const { password, ...rest } = credentials;

    const hashedPassword = await bcrypt.hash(password, 10);

    const userWithHashedPassword = {
      ...rest,
      password: hashedPassword,
    };

    const result = await this.usersService.createUser(userWithHashedPassword);

    return {
      success: result.success,
      message: result.message,
    };
  }
}
