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
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AdminRequirementsService } from './requirements.service';
import { RequirementsService } from '../../requirements/requirements.service';
import { 
  CreateRequirementDto,
  UpdateRequirementDto,
  RequirementResponseDto
} from '../../requirements/dto';
import { 
  ApproveRequirementDto,
  RejectRequirementDto
} from './dto';
import { RequirementsListingDto } from './dto/requirements-listing.dto';
import { RequirementsListingResponseDto } from './dto/requirements-listing-response.dto';
import { AdminAuthGuard } from '../common/guards/admin-auth.guard';
import { MODERATOR_AND_ABOVE } from '../common/decorators/admin-roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@ApiTags('Admin - Requirements')
@Controller('admin/requirements')
@UseGuards(AdminAuthGuard)
@ApiBearerAuth('JWT-auth')
export class AdminRequirementsController {
  constructor(
    private readonly adminRequirementsService: AdminRequirementsService,
    private readonly requirementsService: RequirementsService
  ) {}

  @Get()
  @MODERATOR_AND_ABOVE
  @ApiOperation({ summary: 'Get all requirements for admin with server-side pagination, search, and filtering' })
  @ApiResponse({ 
    status: 200, 
    description: 'Requirements retrieved successfully',
    type: RequirementsListingResponseDto
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10, max: 100)' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search in title, description, product name, brand name, or user info' })
  @ApiQuery({ name: 'status', required: false, enum: ['DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'OPEN', 'QUOTED', 'CLOSED', 'CANCELLED'], description: 'Filter by requirement status' })
  @ApiQuery({ name: 'adminStatus', required: false, enum: ['PENDING', 'APPROVED', 'REJECTED'], description: 'Filter by admin approval status' })
  @ApiQuery({ name: 'postingType', required: false, enum: ['REQUIREMENT', 'REVERSE_BIDDING', 'STANDARD_BIDDING'], description: 'Filter by posting type' })
  @ApiQuery({ name: 'categoryId', required: false, type: String, description: 'Filter by category ID' })
  @ApiQuery({ name: 'subcategoryId', required: false, type: String, description: 'Filter by subcategory ID' })
  @ApiQuery({ name: 'userType', required: false, enum: ['BUYER', 'SELLER', 'BOTH'], description: 'Filter by user type' })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['createdAt', 'updatedAt', 'title', 'status', 'adminStatus'], description: 'Sort by field (default: createdAt)' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'], description: 'Sort order (default: desc)' })
  findAll(@Query() listingDto: RequirementsListingDto) {
    return this.adminRequirementsService.findAllForAdmin(listingDto);
  }

  @Get(':id')
  @MODERATOR_AND_ABOVE
  @ApiOperation({ summary: 'Get requirement details by ID (Admin)' })
  @ApiResponse({ status: 200, description: 'Requirement retrieved successfully', type: RequirementResponseDto })
  @ApiResponse({ status: 404, description: 'Requirement not found' })
  findOne(@Param('id') id: string) {
    return this.adminRequirementsService.findOneForAdmin(id);
  }

  @Post()
  @MODERATOR_AND_ABOVE
  @ApiOperation({ summary: 'Create a new requirement (Admin)' })
  @ApiResponse({ status: 201, description: 'Requirement created successfully', type: RequirementResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() createRequirementDto: CreateRequirementDto, @CurrentUser('id') adminId: string) {
    return this.requirementsService.create(createRequirementDto, adminId);
  }

  @Patch(':id')
  @MODERATOR_AND_ABOVE
  @ApiOperation({ summary: 'Update requirement (Admin)' })
  @ApiResponse({ status: 200, description: 'Requirement updated successfully', type: RequirementResponseDto })
  @ApiResponse({ status: 404, description: 'Requirement not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  update(
    @Param('id') id: string, 
    @Body() updateRequirementDto: UpdateRequirementDto,
    @CurrentUser('id') adminId: string
  ) {
    return this.adminRequirementsService.updateForAdmin(id, updateRequirementDto, adminId);
  }

  @Delete(':id')
  @MODERATOR_AND_ABOVE
  @ApiOperation({ summary: 'Delete requirement (Admin)' })
  @ApiResponse({ status: 200, description: 'Requirement deleted successfully' })
  @ApiResponse({ status: 404, description: 'Requirement not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  remove(@Param('id') id: string, @CurrentUser('id') adminId: string) {
    return this.adminRequirementsService.removeForAdmin(id, adminId);
  }

  @Post(':id/approve')
  @MODERATOR_AND_ABOVE
  @ApiOperation({ summary: 'Approve requirement (Admin only)' })
  @ApiResponse({ status: 200, description: 'Requirement approved successfully', type: RequirementResponseDto })
  @ApiResponse({ status: 404, description: 'Requirement not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  approveRequirement(@Param('id') id: string, @Body() approveDto: ApproveRequirementDto, @CurrentUser('id') adminId: string) {
    return this.adminRequirementsService.approveRequirement(id, adminId);
  }

  @Post(':id/reject')
  @MODERATOR_AND_ABOVE
  @ApiOperation({ summary: 'Reject requirement (Admin only)' })
  @ApiResponse({ status: 200, description: 'Requirement rejected successfully', type: RequirementResponseDto })
  @ApiResponse({ status: 404, description: 'Requirement not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  rejectRequirement(@Param('id') id: string, @Body() rejectDto: RejectRequirementDto, @CurrentUser('id') adminId: string) {
    return this.adminRequirementsService.rejectRequirement(id, rejectDto.rejectionReason, adminId);
  }

  @Get('stats/overview')
  @MODERATOR_AND_ABOVE
  @ApiOperation({ summary: 'Get requirements statistics for admin dashboard' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  @ApiQuery({ name: 'userType', required: false, enum: ['BUYER', 'SELLER', 'BOTH'], description: 'Filter by user type' })
  getStats(@Query('userType') userType?: 'BUYER' | 'SELLER' | 'BOTH') {
    return this.adminRequirementsService.getAdminStats(userType);
  }
}
