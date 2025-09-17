import { ApiProperty } from '@nestjs/swagger';

export class DashboardStatsDto {
  @ApiProperty({ description: 'User statistics' })
  users: {
    total: number;
    kycPending: number;
    active: number;
    inactive: number;
  };

  @ApiProperty({ description: 'Listing statistics' })
  listings: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };

  @ApiProperty({ description: 'Requirement statistics' })
  requirements: {
    total: number;
    pending: number;
    active: number;
    completed: number;
  };

  @ApiProperty({ description: 'Auction statistics' })
  auctions: {
    total: number;
    active: number;
    upcoming: number;
    completed: number;
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
    newListings: number;
    newRequirements: number;
    completedAuctions: number;
  };

  @ApiProperty({ description: 'Timestamp of the data' })
  timestamp: Date;
}
