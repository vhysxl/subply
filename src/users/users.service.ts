import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserRepository } from './repositories/user.repositories';
import * as bcrypt from 'bcryptjs';
import { LoginCredentials, RegisterInterface, User } from 'src/auth/interfaces';

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository) {}

  async createUser(
    user: RegisterInterface,
  ): Promise<{ success: boolean; message: string }> {
    const existingUser = await this.userRepository.findUserByEmail(user.email);

    if (existingUser.length > 0) {
      throw new ConflictException('User with this email already exists');
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const newUser = await this.userRepository.createUser(user);

      return {
        success: true,
        message: 'User created successfully',
      };
    } catch (error) {
      console.error('Error creating user:', error);
      throw new InternalServerErrorException('Error creating user');
    }
  }

  async credentialsCheck({
    email,
    password,
  }: LoginCredentials): Promise<Omit<User, 'password'>> {
    //ngecek user
    const user = await this.userRepository.findUserByEmail(email);

    if (user.length === 0) {
      throw new ConflictException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(password, user[0].password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Rename the destructured password ke _
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...result } = user[0];

    return result;
  }
}
