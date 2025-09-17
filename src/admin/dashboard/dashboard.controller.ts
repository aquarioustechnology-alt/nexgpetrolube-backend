import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { DashboardStatsDto } from './dto/dashboard-stats.dto';
import { AdminAuthGuard } from '../common/guards/admin-auth.guard';
import { FINANCE_AND_ABOVE } from '../common/decorators/admin-roles.decorator';

@ApiTags('Admin - Dashboard')
@Controller('admin/dashboard')
@UseGuards(AdminAuthGuard)
@ApiBearerAuth('JWT-auth')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @FINANCE_AND_ABOVE
  @ApiOperation({ summary: 'Get admin dashboard statistics' })
  @ApiResponse({ 
    status: 200, 
    description: 'Dashboard stats retrieved successfully',
    type: DashboardStatsDto
  })
  getDashboardStats() {
    return this.dashboardService.getDashboardStats();
  }
}
