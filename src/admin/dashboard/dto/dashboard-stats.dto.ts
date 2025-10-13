import { ApiProperty } from '@nestjs/swagger';

export class DashboardStatsDto {
  @ApiProperty({ description: 'User statistics' })
  users: {
    total: number;
    kycPending: number;
    active: number;
    inactive: number;
  };

  @ApiProperty({ description: 'Requirement statistics' })
  requirements: {
    total: number;
    pending: number;
    active: number;
    completed: number;
    standardBidding: number;
    reverseBidding: number;
  };

  @ApiProperty({ description: 'Revenue statistics' })
  revenue: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    growth: number;
  };

  @ApiProperty({ description: 'KYC statistics' })
  kyc: {
    pending: number;
    approved: number;
    rejected: number;
    total: number;
  };

  @ApiProperty({ description: 'Recent activity' })
  recentActivity: {
    newUsers: number;
    newRequirements: number;
  };

  @ApiProperty({ description: 'Timestamp of the data' })
  timestamp: Date;
}
