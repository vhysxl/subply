import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User } from 'interfaces/user.interface';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(
    credentials: User,
  ): Promise<{ token: string; user: Omit<User, 'password'> }> {
    const user = await this.usersService.credentialsCheck(credentials);
    const payload = { sub: user.id, name: user.name, email: user.email };

    return {
      token: await this.jwtService.signAsync(payload),
      user: user,
    };
  }

  async register(user: User): Promise<{ success: boolean; message: string }> {
    const { password, ...rest } = user;

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
