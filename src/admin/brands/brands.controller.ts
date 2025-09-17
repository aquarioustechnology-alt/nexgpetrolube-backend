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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminBrandsService } from './brands.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { BrandListingDto } from './dto/brand-listing.dto';
import { BrandResponseDto } from './dto/brand-response.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';

@ApiTags('Admin - Brands')
@Controller('admin/brands')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AdminBrandsController {
  constructor(private readonly brandsService: AdminBrandsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new brand' })
  @ApiResponse({
    status: 201,
    description: 'Brand created successfully',
    type: BrandResponseDto,
  })
  @ApiResponse({ status: 409, description: 'Brand with this name already exists' })
  create(@Body() createBrandDto: CreateBrandDto) {
    return this.brandsService.create(createBrandDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all brands with filtering and pagination' })
  @ApiResponse({
    status: 200,
    description: 'Brands retrieved successfully',
  })
  findAll(@Query() query: BrandListingDto) {
    return this.brandsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a brand by ID' })
  @ApiResponse({
    status: 200,
    description: 'Brand retrieved successfully',
    type: BrandResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Brand not found' })
  findOne(@Param('id') id: string) {
    return this.brandsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a brand' })
  @ApiResponse({
    status: 200,
    description: 'Brand updated successfully',
    type: BrandResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Brand not found' })
  @ApiResponse({ status: 409, description: 'Brand with this name already exists' })
  update(@Param('id') id: string, @Body() updateBrandDto: UpdateBrandDto) {
    return this.brandsService.update(id, updateBrandDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a brand' })
  @ApiResponse({ status: 200, description: 'Brand deleted successfully' })
  @ApiResponse({ status: 404, description: 'Brand not found' })
  remove(@Param('id') id: string) {
    return this.brandsService.remove(id);
  }
}
