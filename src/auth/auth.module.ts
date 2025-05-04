// auth.module.ts
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { ConfigService } from '@nestjs/config';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [
    DatabaseModule, //Inject database
    UsersModule, //Inject users service
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        global: true, //token sifatnya global
        secret: configService.getOrThrow<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' }, //token cuma valid 1 jam doang
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
