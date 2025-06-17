import { Module } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { StatisticsController } from './statistics.controller';
import { OrdersModule } from 'src/orders/orders.module';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { PaymentsOrdersSharedModule } from 'src/payments-orders-shared/payments-orders-shared.module';
import { DatabaseModule } from 'src/database/database.module';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { StatisticsRepository } from './repositories/statistics.repositories';

@Module({
  imports: [
    OrdersModule,
    UsersModule,
    JwtModule,
    PaymentsOrdersSharedModule,
    DatabaseModule,
  ],
  controllers: [StatisticsController],
  providers: [StatisticsService, RolesGuard, StatisticsRepository],
})
export class StatisticsModule {}
