import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminCountsService } from './counts.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { CountsResponseDto } from './dto/counts-response.dto';

@ApiTags('Admin - Counts')
@Controller('admin/counts')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AdminCountsController {
  constructor(private readonly countsService: AdminCountsService) {}

  @Get('masters')
  @ApiOperation({ summary: 'Get counts for masters data (categories, subcategories, brands, products)' })
  @ApiResponse({
    status: 200,
    description: 'Counts retrieved successfully',
    type: CountsResponseDto,
  })
  async getMastersCounts() {
    return this.countsService.getMastersCounts();
  }
}
