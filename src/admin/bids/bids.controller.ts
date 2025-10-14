import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AdminBidsService } from './bids.service';
import { 
  AdminBidsListingDto, 
  AdminBidsListingResponseDto, 
  AdminBidResponseDto, 
  AdminBidStatsDto,
  RejectBidDto 
} from './dto';
import { AdminAuthGuard } from '../common/guards/admin-auth.guard';
import { MODERATOR_AND_ABOVE } from '../common/decorators/admin-roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@ApiTags('Admin - Bids')
@Controller('admin/bids')
@UseGuards(AdminAuthGuard)
@ApiBearerAuth('JWT-auth')
export class AdminBidsController {
  constructor(private readonly adminBidsService: AdminBidsService) {}

  @Get()
  @MODERATOR_AND_ABOVE
  @ApiOperation({ summary: 'Get all bids for admin with server-side pagination, search, and filtering' })
  @ApiResponse({ 
    status: 200, 
    description: 'Bids retrieved successfully',
    type: AdminBidsListingResponseDto
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10, max: 100)' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search in bid message, requirement details, or user info' })
  @ApiQuery({ name: 'status', required: false, enum: ['active', 'won', 'lost', 'outbid'], description: 'Filter by bid status' })
  @ApiQuery({ name: 'postingType', required: false, enum: ['REVERSE_BIDDING', 'STANDARD_BIDDING'], description: 'Filter by posting type' })
  @ApiQuery({ name: 'requirementId', required: false, type: String, description: 'Filter by requirement ID' })
  @ApiQuery({ name: 'bidderId', required: false, type: String, description: 'Filter by bidder user ID' })
  @ApiQuery({ name: 'requirementOwnerId', required: false, type: String, description: 'Filter by requirement owner ID' })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['createdAt', 'updatedAt', 'offeredUnitPrice', 'bidStatus'], description: 'Sort by field (default: createdAt)' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'], description: 'Sort order (default: desc)' })
  findAll(@Query() listingDto: AdminBidsListingDto) {
    return this.adminBidsService.findAllForAdmin(listingDto);
  }

  @Get(':id')
  @MODERATOR_AND_ABOVE
  @ApiOperation({ summary: 'Get bid details by ID (Admin)' })
  @ApiResponse({ status: 200, description: 'Bid retrieved successfully', type: AdminBidResponseDto })
  @ApiResponse({ status: 404, description: 'Bid not found' })
  findOne(@Param('id') id: string) {
    return this.adminBidsService.findOneForAdmin(id);
  }

  @Patch(':id')
  @MODERATOR_AND_ABOVE
  @ApiOperation({ summary: 'Update bid status (Admin)' })
  @ApiResponse({ status: 200, description: 'Bid updated successfully', type: AdminBidResponseDto })
  @ApiResponse({ status: 404, description: 'Bid not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  update(
    @Param('id') id: string, 
    @Body() updateData: { action: string; notes?: string },
    @CurrentUser('id') adminId: string
  ) {
    return this.adminBidsService.updateForAdmin(id, updateData, adminId);
  }

  @Delete(':id')
  @MODERATOR_AND_ABOVE
  @ApiOperation({ summary: 'Delete bid (Admin)' })
  @ApiResponse({ status: 200, description: 'Bid deleted successfully' })
  @ApiResponse({ status: 404, description: 'Bid not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  remove(@Param('id') id: string, @CurrentUser('id') adminId: string) {
    return this.adminBidsService.removeForAdmin(id, adminId);
  }

  @Post(':id/approve')
  @MODERATOR_AND_ABOVE
  @ApiOperation({ summary: 'Approve bid (Admin only)' })
  @ApiResponse({ status: 200, description: 'Bid approved successfully', type: AdminBidResponseDto })
  @ApiResponse({ status: 404, description: 'Bid not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  approveBid(@Param('id') id: string, @Body() body: { notes?: string }, @CurrentUser('id') adminId: string) {
    return this.adminBidsService.updateForAdmin(id, {
      action: 'WON',
      notes: body?.notes,
    }, adminId);
  }

  @Post(':id/reject')
  @MODERATOR_AND_ABOVE
  @ApiOperation({ summary: 'Reject bid (Admin only)' })
  @ApiResponse({ status: 200, description: 'Bid rejected successfully', type: AdminBidResponseDto })
  @ApiResponse({ status: 404, description: 'Bid not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  rejectBid(@Param('id') id: string, @Body() rejectDto: RejectBidDto, @CurrentUser('id') adminId: string) {
    return this.adminBidsService.updateForAdmin(id, {
      action: 'REJECTED',
      notes: rejectDto.reason,
    }, adminId);
  }

  @Get('stats/overview')
  @MODERATOR_AND_ABOVE
  @ApiOperation({ summary: 'Get bids statistics for admin dashboard' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully', type: AdminBidStatsDto })
  @ApiQuery({ name: 'postingType', required: false, enum: ['REVERSE_BIDDING', 'STANDARD_BIDDING'], description: 'Filter by posting type' })
  getStats(@Query('postingType') postingType?: 'REVERSE_BIDDING' | 'STANDARD_BIDDING') {
    return this.adminBidsService.getAdminStats(postingType);
  }
}
