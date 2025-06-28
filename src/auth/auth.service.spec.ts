import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  const mockUser = {
    userId: randomUUID(),
    name: 'Yogi',
    email: 'yogi@gmail.com',
    createdAt: new Date(),
    roles: ['user'] as ('user' | 'admin' | 'superadmin')[],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            credentialsCheck: jest.fn(),
            createUser: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
  });

  describe('login', () => {
    it('should return token and user on successful login', async () => {
      usersService.credentialsCheck.mockResolvedValue(mockUser);
      jwtService.signAsync.mockResolvedValue('jwt-token');

      const result = await authService.login({
        email: 'john@example.com',
        password: 'password123',
      });

      expect(result).toEqual({
        token: 'jwt-token',
        user: mockUser,
      });
    });

    it('should throw error when credentials are invalid', async () => {
      usersService.credentialsCheck.mockRejectedValue(
        new Error('Invalid credentials'),
      );

      await expect(
        authService.login({ email: 'wrong@email.com', password: 'wrong' }),
      ).rejects.toThrow('Invalid credentials');
    });
  });

  describe('register', () => {
    it('should hash password and create user', async () => {
      const hashSpy = jest
        .spyOn(bcrypt, 'hash')
        .mockResolvedValue('hashed-password' as never);
      usersService.createUser.mockResolvedValue({
        success: true,
        message: 'User created successfully',
        data: mockUser,
      });

      const result = await authService.register({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      });

      expect(hashSpy).toHaveBeenCalledWith('password123', 10);
      expect(usersService.createUser).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'hashed-password',
        }),
      );
      expect(result.success).toBe(true);

      hashSpy.mockRestore();
    });

    it('should throw error when user creation fails', async () => {
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed-password' as never);
      usersService.createUser.mockRejectedValue(
        new Error('User already exists'),
      );

      await expect(
        authService.register({
          name: 'John Doe',
          email: 'existing@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow('User already exists');
    });
  });
});
