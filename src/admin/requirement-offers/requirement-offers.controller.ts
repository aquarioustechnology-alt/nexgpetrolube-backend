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
import { AdminRequirementOffersService } from './requirement-offers.service';
import { OffersService } from '../../offers/offers.service';
import { UpdateOfferStatusDto } from '../../offers/dto/update-offer.dto';
import { OfferResponseDto } from '../../offers/dto/offer-response.dto';
import { RequirementOffersListingDto } from './dto/requirement-offers-listing.dto';
import { RequirementOffersListingResponseDto } from './dto';
import { AdminAuthGuard } from '../common/guards/admin-auth.guard';
import { MODERATOR_AND_ABOVE } from '../common/decorators/admin-roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@ApiTags('Admin - Requirement Offers')
@Controller('admin/requirement-offers')
@UseGuards(AdminAuthGuard)
@ApiBearerAuth('JWT-auth')
export class AdminRequirementOffersController {
  constructor(
    private readonly adminRequirementOffersService: AdminRequirementOffersService,
    private readonly offersService: OffersService
  ) {}

  @Get()
  @MODERATOR_AND_ABOVE
  @ApiOperation({ summary: 'Get all requirement offers for admin with server-side pagination, search, and filtering' })
  @ApiResponse({ 
    status: 200, 
    description: 'Requirement offers retrieved successfully',
    type: RequirementOffersListingResponseDto
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10, max: 100)' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search in offer message, requirement details, or user info' })
  @ApiQuery({ name: 'offerStatus', required: false, enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'WITHDRAWN', 'COUNTERED'], description: 'Filter by offer status' })
  @ApiQuery({ name: 'requirementOwnerType', required: false, enum: ['BUYER', 'SELLER', 'BOTH'], description: 'Filter by requirement owner type' })
  @ApiQuery({ name: 'postingType', required: false, enum: ['REQUIREMENT', 'REVERSE_BIDDING', 'STANDARD_BIDDING'], description: 'Filter by posting type' })
  @ApiQuery({ name: 'negotiableType', required: false, enum: ['negotiable', 'non-negotiable'], description: 'Filter by negotiable type' })
  @ApiQuery({ name: 'isCounterOffer', required: false, type: Boolean, description: 'Filter by counter offer status' })
  @ApiQuery({ name: 'requirementId', required: false, type: String, description: 'Filter by requirement ID' })
  @ApiQuery({ name: 'offerUserId', required: false, type: String, description: 'Filter by offer user ID' })
  @ApiQuery({ name: 'requirementOwnerId', required: false, type: String, description: 'Filter by requirement owner ID' })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['createdAt', 'updatedAt', 'offeredUnitPrice', 'offerStatus'], description: 'Sort by field (default: createdAt)' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'], description: 'Sort order (default: desc)' })
  findAll(@Query() listingDto: RequirementOffersListingDto) {
    return this.adminRequirementOffersService.findAllForAdmin(listingDto);
  }

  @Get(':id')
  @MODERATOR_AND_ABOVE
  @ApiOperation({ summary: 'Get requirement offer details by ID (Admin)' })
  @ApiResponse({ status: 200, description: 'Requirement offer retrieved successfully', type: OfferResponseDto })
  @ApiResponse({ status: 404, description: 'Requirement offer not found' })
  findOne(@Param('id') id: string) {
    return this.adminRequirementOffersService.findOneForAdmin(id);
  }

  @Patch(':id')
  @MODERATOR_AND_ABOVE
  @ApiOperation({ summary: 'Update requirement offer status (Admin)' })
  @ApiResponse({ status: 200, description: 'Requirement offer updated successfully', type: OfferResponseDto })
  @ApiResponse({ status: 404, description: 'Requirement offer not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  update(
    @Param('id') id: string, 
    @Body() updateOfferDto: UpdateOfferStatusDto,
    @CurrentUser('id') adminId: string
  ) {
    return this.adminRequirementOffersService.updateForAdmin(id, updateOfferDto, adminId);
  }

  @Delete(':id')
  @MODERATOR_AND_ABOVE
  @ApiOperation({ summary: 'Delete requirement offer (Admin)' })
  @ApiResponse({ status: 200, description: 'Requirement offer deleted successfully' })
  @ApiResponse({ status: 404, description: 'Requirement offer not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  remove(@Param('id') id: string, @CurrentUser('id') adminId: string) {
    return this.adminRequirementOffersService.removeForAdmin(id, adminId);
  }

  @Post(':id/accept')
  @MODERATOR_AND_ABOVE
  @ApiOperation({ summary: 'Accept requirement offer (Admin only)' })
  @ApiResponse({ status: 200, description: 'Requirement offer accepted successfully', type: OfferResponseDto })
  @ApiResponse({ status: 404, description: 'Requirement offer not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  acceptOffer(@Param('id') id: string, @Body() body: { notes?: string }, @CurrentUser('id') adminId: string) {
    return this.adminRequirementOffersService.updateForAdmin(id, {
      action: 'ACCEPTED' as any,
      notes: body?.notes,
    }, adminId);
  }

  @Post(':id/reject')
  @MODERATOR_AND_ABOVE
  @ApiOperation({ summary: 'Reject requirement offer (Admin only)' })
  @ApiResponse({ status: 200, description: 'Requirement offer rejected successfully', type: OfferResponseDto })
  @ApiResponse({ status: 404, description: 'Requirement offer not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  rejectOffer(@Param('id') id: string, @Body() body: { notes?: string }, @CurrentUser('id') adminId: string) {
    return this.adminRequirementOffersService.updateForAdmin(id, {
      action: 'REJECTED' as any,
      notes: body?.notes,
    }, adminId);
  }

  @Get('stats/overview')
  @MODERATOR_AND_ABOVE
  @ApiOperation({ summary: 'Get requirement offers statistics for admin dashboard' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  @ApiQuery({ name: 'requirementOwnerType', required: false, enum: ['BUYER', 'SELLER', 'BOTH'], description: 'Filter by requirement owner type' })
  getStats(@Query('requirementOwnerType') requirementOwnerType?: 'BUYER' | 'SELLER' | 'BOTH') {
    return this.adminRequirementOffersService.getAdminStats(requirementOwnerType);
  }
}
