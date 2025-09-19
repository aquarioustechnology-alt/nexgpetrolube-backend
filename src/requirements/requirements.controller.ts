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
  Request
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { RequirementsService } from './requirements.service';
import { CreateRequirementDto } from './dto/create-requirement.dto';
import { UpdateRequirementDto } from './dto/update-requirement.dto';
import { RequirementResponseDto } from './dto/requirement-response.dto';
import { ApproveRequirementDto, RejectRequirementDto } from './dto/admin-approval.dto';
import { RequirementStatus } from './dto/create-requirement.dto';
import { RequirementStatus as PrismaRequirementStatus } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Requirements')
@Controller('requirements')
export class RequirementsController {
  constructor(private readonly requirementsService: RequirementsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new requirement' })
  @ApiResponse({ status: 201, description: 'Requirement created successfully', type: RequirementResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() createRequirementDto: CreateRequirementDto, @Request() req) {
    return this.requirementsService.create(createRequirementDto, req.user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'Get all requirements with pagination' })
  @ApiResponse({ status: 200, description: 'Requirements retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'status', required: false, enum: RequirementStatus, description: 'Filter by status' })
  findAll(
    @Query('page') pageParam?: string,
    @Query('limit') limitParam?: string,
    @Query('status') status?: PrismaRequirementStatus
  ) {
    const page = pageParam ? parseInt(pageParam, 10) : 1;
    const limit = limitParam ? parseInt(limitParam, 10) : 10;
    return this.requirementsService.findAll(page, limit, status);
  }

  @Get('my-requirements')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user requirements' })
  @ApiResponse({ status: 200, description: 'User requirements retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  findMyRequirements(
    @Request() req,
    @Query('page') pageParam?: string,
    @Query('limit') limitParam?: string
  ) {
    const page = pageParam ? parseInt(pageParam, 10) : 1;
    const limit = limitParam ? parseInt(limitParam, 10) : 10;
    return this.requirementsService.findByUser(req.user.sub, page, limit);
  }

  @Get('dashboard/listing')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get requirements for dashboard listing with role-based filtering' })
  @ApiResponse({ status: 200, description: 'Requirements retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'status', required: false, enum: RequirementStatus, description: 'Filter by status' })
  @ApiQuery({ name: 'postingType', required: false, enum: ['REQUIREMENT', 'REVERSE_BIDDING', 'STANDARD_BIDDING'], description: 'Filter by posting type' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search query' })
  @ApiQuery({ name: 'userType', required: false, enum: ['SELLER', 'BUYER', 'BOTH'], description: 'Filter by user type' })
  getDashboardListing(
    @Request() req,
    @Query('page') pageParam?: string,
    @Query('limit') limitParam?: string,
    @Query('status') status?: PrismaRequirementStatus,
    @Query('postingType') postingType?: string,
    @Query('search') search?: string,
    @Query('userType') userType?: string
  ) {
    const page = pageParam ? parseInt(pageParam, 10) : 1;
    const limit = limitParam ? parseInt(limitParam, 10) : 10;
    return this.requirementsService.getDashboardListing(
      req.user.sub, 
      req.user.role, 
      page, 
      limit, 
      status, 
      postingType, 
      search,
      userType
    );
  }

  @Get('dashboard/details/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get requirement details for dashboard' })
  @ApiResponse({ status: 200, description: 'Requirement details retrieved successfully', type: RequirementResponseDto })
  @ApiResponse({ status: 404, description: 'Requirement not found' })
  getDashboardDetails(@Param('id') id: string, @Request() req) {
    return this.requirementsService.getDashboardDetails(id, req.user.sub, req.user.role);
  }

  @Get('dropdowns/categories')
  @ApiOperation({ summary: 'Get all categories for dropdown' })
  @ApiResponse({ status: 200, description: 'Categories retrieved successfully' })
  getCategories() {
    return this.requirementsService.getCategories();
  }

  @Get('dropdowns/subcategories/:categoryId')
  @ApiOperation({ summary: 'Get subcategories by category ID' })
  @ApiResponse({ status: 200, description: 'Subcategories retrieved successfully' })
  getSubcategories(@Param('categoryId') categoryId: string) {
    return this.requirementsService.getSubcategories(categoryId);
  }

  @Get('dropdowns/products/:categoryId')
  @ApiOperation({ summary: 'Get products by category ID and optional subcategory ID' })
  @ApiResponse({ status: 200, description: 'Products retrieved successfully' })
  getProducts(
    @Param('categoryId') categoryId: string,
    @Query('subcategoryId') subcategoryId?: string
  ) {
    return this.requirementsService.getProducts(categoryId, subcategoryId);
  }

  @Get('dropdowns/brands')
  @ApiOperation({ summary: 'Get all brands for dropdown' })
  @ApiResponse({ status: 200, description: 'Brands retrieved successfully' })
  getBrands() {
    return this.requirementsService.getBrands();
  }


  @Get('products/:productId/specifications')
  @ApiOperation({ summary: 'Get technical specifications for a product' })
  @ApiResponse({ status: 200, description: 'Product specifications retrieved successfully' })
  getProductSpecifications(@Param('productId') productId: string) {
    return this.requirementsService.getProductSpecifications(productId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get requirement by ID' })
  @ApiResponse({ status: 200, description: 'Requirement retrieved successfully', type: RequirementResponseDto })
  @ApiResponse({ status: 404, description: 'Requirement not found' })
  findOne(@Param('id') id: string) {
    return this.requirementsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update requirement' })
  @ApiResponse({ status: 200, description: 'Requirement updated successfully', type: RequirementResponseDto })
  @ApiResponse({ status: 404, description: 'Requirement not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  update(
    @Param('id') id: string, 
    @Body() updateRequirementDto: UpdateRequirementDto,
    @Request() req
  ) {
    return this.requirementsService.update(id, updateRequirementDto, req.user.sub);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete requirement' })
  @ApiResponse({ status: 200, description: 'Requirement deleted successfully' })
  @ApiResponse({ status: 404, description: 'Requirement not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  remove(@Param('id') id: string, @Request() req) {
    return this.requirementsService.remove(id, req.user.sub);
  }

  // Admin approval endpoints
  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve requirement (Admin only)' })
  @ApiResponse({ status: 200, description: 'Requirement approved successfully', type: RequirementResponseDto })
  @ApiResponse({ status: 404, description: 'Requirement not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  approveRequirement(@Param('id') id: string, @Body() approveDto: ApproveRequirementDto, @Request() req) {
    return this.requirementsService.approveRequirement(id, req.user.sub);
  }

  @Patch(':id/reject')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reject requirement (Admin only)' })
  @ApiResponse({ status: 200, description: 'Requirement rejected successfully', type: RequirementResponseDto })
  @ApiResponse({ status: 404, description: 'Requirement not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  rejectRequirement(@Param('id') id: string, @Body() rejectDto: RejectRequirementDto, @Request() req) {
    return this.requirementsService.rejectRequirement(id, rejectDto.rejectionReason, req.user.sub);
  }
}
