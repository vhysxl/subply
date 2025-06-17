import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserRepository } from './repositories/user.repositories';
import * as bcrypt from 'bcryptjs';
import { AuthInterface } from 'src/auth/interfaces';
import { User } from './interfaces';
import { AuditLogRepository } from 'src/audit-log/repositories/audit-log.repository';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly auditLogRepository: AuditLogRepository,
  ) {}

  async createUser(user: AuthInterface): Promise<{
    success: boolean;
    message: string;
    data: Omit<User, 'password'>;
  }> {
    try {
      const newUser = await this.userRepository.createUser(user);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = newUser;
      return {
        success: true,
        message: 'User created successfully',
        data: result,
      };
    } catch (error) {
      console.error('Error creating user:', error);

      if (error instanceof ConflictException) {
        throw error;
      }

      throw new InternalServerErrorException('Error creating user');
    }
  }

  async credentialsCheck({
    email,
    password,
  }: Pick<AuthInterface, 'email' | 'password'>): Promise<
    Omit<User, 'password'>
  > {
    try {
      const user = await this.userRepository.findUserByEmail(email);

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...result } = user;
      return result;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }

      console.error('Unexpected error during credentials check:', error);
      throw new InternalServerErrorException('Authentication service error');
    }
  }

  async findAllUsers(
    page: number,
    limit: number,
  ): Promise<{
    success: boolean;
    message: string;
    data: Omit<User, 'password'>[];
  }> {
    const users = await this.userRepository.findAllUsers(page, limit);

    if (!users) {
      throw new InternalServerErrorException('failed to fetch users');
    }

    return {
      success: true,
      message: 'Users fetched successfully',
      data: users,
    };
  }

  async updateUser(
    updateData: Partial<User>,
    userId: string,
    adminId?: string,
  ): Promise<{
    success: boolean;
    message: string;
    data: Omit<User, 'password'>;
  }> {
    const user = await this.userRepository.findUserById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedData = await this.userRepository.updateUser(
      updateData,
      userId,
    );

    if (!updatedData) {
      throw new InternalServerErrorException('Failed to update user');
    }

    if (adminId) {
      await this.auditLogRepository.createLog(
        adminId,
        `updated user ${user.userId}`,
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...result } = updatedData;

    return {
      success: true,
      message: 'User updated successfully',
      data: result,
    };
  }

  async deleteUser(
    userId: string,
    adminId: string,
  ): Promise<{
    success: boolean;
    message: string;

    data: Omit<User, 'password'>;
  }> {
    const user = await this.userRepository.findUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const deletedUser = await this.userRepository.deleteUser(userId);

    if (!deletedUser) {
      throw new InternalServerErrorException('Failed to delete user');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...result } = deletedUser;

    await this.auditLogRepository.createLog(
      adminId,
      `Updated product ${user.userId}`,
    );

    return {
      success: true,
      message: 'User deleted successfully',
      data: result,
    };
  }

  async findOneUser(userId: string): Promise<{
    success: boolean;
    message: string;
    data: Omit<User, 'password'>;
  }> {
    const user = await this.userRepository.findUserById(userId);
    if (!user) throw new NotFoundException('User not found');

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...rest } = user;

    return {
      success: true,
      message: 'Success fetching user',
      data: rest,
    };
  }

  async searchUserByName(name: string): Promise<{
    success: true;
    message: string;
    data: Omit<User, 'password'>[];
  }> {
    const users = await this.userRepository.searchUserByName(name);

    if (users.length === 0) throw new NotFoundException('User not found');

    return {
      success: true,
      message: 'Success finding user',
      data: users,
    };
  }
}
