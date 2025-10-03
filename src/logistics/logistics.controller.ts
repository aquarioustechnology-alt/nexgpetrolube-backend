import { Controller, Post, Get, Put, Body, Param, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LogisticsService } from './logistics.service';
import { CreateLogisticsDto } from './dto/create-logistics.dto';
import { LogisticsResponseDto } from './dto/logistics-response.dto';
import { LogisticsStatus } from '@prisma/client';

@ApiTags('Logistics')
@Controller('logistics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LogisticsController {
  constructor(private readonly logisticsService: LogisticsService) {}

  @Post()
  @ApiOperation({ summary: 'Create logistics entry for an offer' })
  @ApiResponse({ status: 201, description: 'Logistics created successfully', type: LogisticsResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Offer not found' })
  async createLogistics(@Body() createLogisticsDto: CreateLogisticsDto, @Request() req) {
    return this.logisticsService.createLogistics(createLogisticsDto, req.user.sub);
  }

  @Get('offer/:offerId')
  @ApiOperation({ summary: 'Get logistics details by offer ID' })
  @ApiResponse({ status: 200, description: 'Logistics details retrieved successfully', type: LogisticsResponseDto })
  @ApiResponse({ status: 404, description: 'Logistics not found' })
  async getLogisticsByOfferId(@Param('offerId') offerId: string) {
    return this.logisticsService.getLogisticsByOfferId(offerId);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update logistics status' })
  @ApiResponse({ status: 200, description: 'Logistics status updated successfully', type: LogisticsResponseDto })
  @ApiResponse({ status: 404, description: 'Logistics not found' })
  async updateLogisticsStatus(
    @Param('id') logisticsId: string,
    @Body('status') status: LogisticsStatus,
  ) {
    return this.logisticsService.updateLogisticsStatus(logisticsId, status);
  }
}
