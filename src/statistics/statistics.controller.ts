import {
  Controller,
  Get,
  InternalServerErrorException,
  Query,
  UseGuards,
} from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorator/role.decorator';
import { Role } from 'src/common/constants/role.enum';

@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('dashboard')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.admin, Role.superadmin)
  async getDashboardStats() {
    try {
      const [dailyOrders, dailyUsers, unprocessedOrders, dailyRevenue] =
        await Promise.all([
          this.statisticsService.getTotalDailyOrders(),
          this.statisticsService.getTotalDailyNewUser(),
          this.statisticsService.getUnprocessedOrders(),
          this.statisticsService.getDailyRevenue(),
        ]);

      return {
        success: true,
        data: {
          dailyOrders: dailyOrders.data,
          dailyUsers: dailyUsers.data,
          unprocessedOrders: unprocessedOrders.data,
          dailyRevenue: dailyRevenue.data,
        },
      };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Failed to fetch dashboard stats');
    }
  }

  @Get('monthlyReport')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.admin, Role.superadmin)
  async getMonthlyReport(
    @Query('year') year?: number,
    @Query('month') month?: number,
  ) {
    const currentYear = year || new Date().getFullYear();
    const currentMonth = month || new Date().getMonth() + 1;

    return this.statisticsService.getMonthlySalesReport(
      currentYear,
      currentMonth,
    );
  }
}
