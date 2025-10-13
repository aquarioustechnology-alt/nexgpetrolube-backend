import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { DashboardStatsDto } from './dto/dashboard-stats.dto';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats(): Promise<DashboardStatsDto> {
    const [
      totalUsers,
      pendingKyc,
      activeUsers,
      inactiveUsers,
      totalRequirements,
      pendingRequirements,
      activeRequirements,
      completedRequirements,
      standardBiddingRequirements,
      reverseBiddingRequirements,
      approvedKyc,
      rejectedKyc,
      totalKyc,
      totalRevenue,
      thisMonthRevenue,
      lastMonthRevenue,
      recentNewUsers,
      recentNewRequirements,
    ] = await Promise.all([
      // User stats
      this.prisma.user.count(),
      this.prisma.user.count({ where: { kycStatus: 'PENDING' } }),
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.user.count({ where: { isActive: false } }),

      // Requirement stats
      this.prisma.requirement.count(),
      this.prisma.requirement.count({ where: { status: 'OPEN' } }),
      this.prisma.requirement.count({ where: { status: 'QUOTED' } }),
      this.prisma.requirement.count({ where: { status: 'CLOSED' } }),
      this.prisma.requirement.count({ where: { postingType: 'STANDARD_BIDDING' } }),
      this.prisma.requirement.count({ where: { postingType: 'REVERSE_BIDDING' } }),

      // KYC stats
      this.prisma.user.count({ where: { kycStatus: 'APPROVED' } }),
      this.prisma.user.count({ where: { kycStatus: 'REJECTED' } }),
      this.prisma.user.count({ where: { kycStatus: { not: 'NOT_SUBMITTED' } } }),

      // Revenue stats
      this.prisma.invoice.aggregate({
        _sum: { amount: true },
        where: { status: 'paid' },
      }),
      this.prisma.invoice.aggregate({
        _sum: { amount: true },
        where: { 
          status: 'paid',
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
          },
        },
      }),
      this.prisma.invoice.aggregate({
        _sum: { amount: true },
        where: { 
          status: 'paid',
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
            lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),

      // Recent activity (last 7 days)
      this.prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      this.prisma.requirement.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    // Calculate revenue growth
    const currentMonthRevenue = Number(thisMonthRevenue._sum.amount || 0);
    const previousMonthRevenue = Number(lastMonthRevenue._sum.amount || 0);
    const revenueGrowth = previousMonthRevenue > 0 
      ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100 
      : 0;

    return {
      users: {
        total: totalUsers,
        kycPending: pendingKyc,
        active: activeUsers,
        inactive: inactiveUsers,
      },
      requirements: {
        total: totalRequirements,
        pending: pendingRequirements,
        active: activeRequirements,
        completed: completedRequirements,
        standardBidding: standardBiddingRequirements,
        reverseBidding: reverseBiddingRequirements,
      },
      revenue: {
        total: Number(totalRevenue._sum.amount || 0),
        thisMonth: currentMonthRevenue,
        lastMonth: previousMonthRevenue,
        growth: Math.round(revenueGrowth * 100) / 100, // Round to 2 decimal places
      },
      kyc: {
        pending: pendingKyc,
        approved: approvedKyc,
        rejected: rejectedKyc,
        total: totalKyc,
      },
      recentActivity: {
        newUsers: recentNewUsers,
        newRequirements: recentNewRequirements,
      },
      timestamp: new Date(),
    };
  }
}
