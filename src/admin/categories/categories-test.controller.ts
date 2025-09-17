import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AdminCategoriesService } from './categories.service';
import { CategoryListingDto } from './dto/category-listing.dto';

@ApiTags('Admin - Categories (Test)')
@Controller('admin/categories')
export class AdminCategoriesTestController {
  constructor(private readonly categoriesService: AdminCategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all categories with filtering and pagination (No Auth)' })
  @ApiResponse({
    status: 200,
    description: 'Categories retrieved successfully',
  })
  findAll(@Query() query: CategoryListingDto) {
    return this.categoriesService.findAll(query);
  }
}
