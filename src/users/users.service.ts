import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserRepository } from './repositories/user.repositories';
import { User } from '../../interfaces/user.interface';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository) {}

  async createUser(user: User): Promise<{ success: boolean; message: string }> {
    const existingUser = await this.userRepository.findUserByEmail(user.email);
    console.log('existingUser', existingUser);

    if (existingUser.length > 0) {
      throw new ConflictException('User with this email already exists');
    }

    try {
      const newUser = await this.userRepository.createUser(user);
      console.log(newUser);

      return {
        success: true,
        message: 'User created successfully',
      };
    } catch (error) {
      console.error('Error creating user:', error);
      throw new InternalServerErrorException('Error creating user');
    }
  }

  async credentialsCheck(credentials: User): Promise<Omit<User, 'password'>> {
    const user = await this.userRepository.findUserByEmail(credentials.email);

    if (user.length === 0) {
      throw new ConflictException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(
      credentials.password,
      user[0].password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Menghilangkan password dari response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user[0];

    return result;
  }
}
