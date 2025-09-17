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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminCategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryListingDto } from './dto/category-listing.dto';
import { CategoryResponseDto } from './dto/category-response.dto';
import { AdminAuthGuard } from '../common/guards/admin-auth.guard';
import { AdminRolesGuard } from '../common/guards/admin-roles.guard';
import { AdminRoles } from '../common/decorators/admin-roles.decorator';
import { AdminRole } from '@prisma/client';
// import { Public } from '../../../auth/decorators/public.decorator';

@ApiTags('Admin - Categories')
@Controller('admin/categories')
@UseGuards(AdminAuthGuard, AdminRolesGuard)
@ApiBearerAuth()
export class AdminCategoriesController {
  constructor(private readonly categoriesService: AdminCategoriesService) {}

  @Post()
  @AdminRoles(AdminRole.SUPER_ADMIN, AdminRole.CMS_EDITOR)
  @ApiOperation({ summary: 'Create a new category' })
  @ApiResponse({
    status: 201,
    description: 'Category created successfully',
    type: CategoryResponseDto,
  })
  @ApiResponse({ status: 409, description: 'Category name already exists' })
  @ApiResponse({ status: 404, description: 'Parent category not found' })
  create(@Body() createCategoryDto: CreateCategoryDto): Promise<CategoryResponseDto> {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all categories with filtering and pagination' })
  @ApiResponse({
    status: 200,
    description: 'Categories retrieved successfully',
  })
  findAll(@Query() query: CategoryListingDto) {
    return this.categoriesService.findAll(query);
  }

  @Get('hierarchy')
  @AdminRoles(AdminRole.SUPER_ADMIN, AdminRole.CMS_EDITOR, AdminRole.MODERATOR)
  @ApiOperation({ summary: 'Get category hierarchy (tree structure)' })
  @ApiResponse({
    status: 200,
    description: 'Category hierarchy retrieved successfully',
    type: [CategoryResponseDto],
  })
  getHierarchy(): Promise<CategoryResponseDto[]> {
    return this.categoriesService.getHierarchy();
  }

  @Get(':id')
  @AdminRoles(AdminRole.SUPER_ADMIN, AdminRole.CMS_EDITOR, AdminRole.MODERATOR)
  @ApiOperation({ summary: 'Get category by ID' })
  @ApiResponse({
    status: 200,
    description: 'Category retrieved successfully',
    type: CategoryResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Category not found' })
  findOne(@Param('id') id: string): Promise<CategoryResponseDto> {
    return this.categoriesService.findOne(id);
  }

  @Patch(':id')
  @AdminRoles(AdminRole.SUPER_ADMIN, AdminRole.CMS_EDITOR)
  @ApiOperation({ summary: 'Update category' })
  @ApiResponse({
    status: 200,
    description: 'Category updated successfully',
    type: CategoryResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @ApiResponse({ status: 409, description: 'Category name already exists' })
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<CategoryResponseDto> {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @AdminRoles(AdminRole.SUPER_ADMIN, AdminRole.CMS_EDITOR)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete category' })
  @ApiResponse({ status: 204, description: 'Category deleted successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @ApiResponse({ status: 409, description: 'Cannot delete category with dependencies' })
  remove(@Param('id') id: string): Promise<void> {
    return this.categoriesService.remove(id);
  }
}
