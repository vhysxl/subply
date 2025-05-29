import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './products/products.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DatabaseModule } from './database/database.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module';
import { PaymentsOrdersSharedModule } from './payments-orders-shared/payments-orders-shared.module';
import { JwtModule } from '@nestjs/jwt';
import { GamesModule } from './games/games.module';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    JwtModule,
    UsersModule,
    DatabaseModule,
    OrdersModule,
    PaymentsModule,
    ProductsModule,
    PaymentsOrdersSharedModule,
    GamesModule,
    UploadModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
