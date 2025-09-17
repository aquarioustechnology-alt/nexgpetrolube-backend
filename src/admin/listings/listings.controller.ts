import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ListingsService } from './listings.service';
import { ListingListingDto, PaginatedListingResponseDto } from './dto/listing-listing.dto';
import { ListingApproveDto, ListingRejectDto, ListingActionResponseDto } from './dto/listing-action.dto';
import { AdminAuthGuard } from '../common/guards/admin-auth.guard';
import { MODERATOR_AND_ABOVE } from '../common/decorators/admin-roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@ApiTags('Admin - Listings')
@Controller('admin/listings')
@UseGuards(AdminAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ListingsController {
  constructor(private readonly listingsService: ListingsService) {}

  @Get('queue')
  @MODERATOR_AND_ABOVE
  @ApiOperation({ summary: 'Get listings review queue' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Listings queue retrieved successfully' })
  getListingsQueue(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
  ) {
    return this.listingsService.getListingsQueue(page, limit);
  }

  @Get()
  @MODERATOR_AND_ABOVE
  @ApiOperation({ summary: 'Get all listings with filtering' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: ['PENDING', 'APPROVED', 'REJECTED', 'ACTIVE', 'INACTIVE'] })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'subcategory', required: false, type: String })
  @ApiQuery({ name: 'role', required: false, enum: ['BUYER', 'SELLER', 'BOTH'] })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @ApiResponse({ 
    status: 200, 
    description: 'Listings retrieved successfully',
    type: PaginatedListingResponseDto
  })
  getListings(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('search') search?: string,
    @Query('status') status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'INACTIVE',
    @Query('category') category?: string,
    @Query('subcategory') subcategory?: string,
    @Query('role') role?: 'BUYER' | 'SELLER' | 'BOTH',
    @Query('isActive') isActive?: boolean,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    const listingListingDto: ListingListingDto = {
      page,
      limit,
      search,
      status,
      category,
      subcategory,
      role,
      isActive,
      sortBy,
      sortOrder,
    };
    return this.listingsService.getListings(listingListingDto);
  }

  @Post(':id/approve')
  @MODERATOR_AND_ABOVE
  @ApiOperation({ summary: 'Approve a listing' })
  @ApiResponse({ 
    status: 200, 
    description: 'Listing approved successfully',
    type: ListingActionResponseDto
  })
  @ApiResponse({ status: 404, description: 'Listing not found' })
  @ApiResponse({ status: 400, description: 'Listing is not in pending status' })
  approveListing(
    @Param('id') listingId: string,
    @CurrentUser('id') adminId: string,
  ) {
    return this.listingsService.approveListing(listingId, adminId);
  }

  @Post(':id/reject')
  @MODERATOR_AND_ABOVE
  @ApiOperation({ summary: 'Reject a listing' })
  @ApiResponse({ 
    status: 200, 
    description: 'Listing rejected successfully',
    type: ListingActionResponseDto
  })
  @ApiResponse({ status: 404, description: 'Listing not found' })
  @ApiResponse({ status: 400, description: 'Listing is not in pending status' })
  rejectListing(
    @Param('id') listingId: string,
    @Body() body: { reason: string },
    @CurrentUser('id') adminId: string,
  ) {
    return this.listingsService.rejectListing(listingId, adminId, body.reason);
  }
}
