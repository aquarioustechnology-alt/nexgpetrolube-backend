import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { KycService } from './kyc.service';
import { KycListingDto, PaginatedKycResponseDto } from './dto/kyc-listing.dto';
import { KycApproveDto, KycRejectDto, KycActionResponseDto } from './dto/kyc-action.dto';
import { AdminAuthGuard } from '../common/guards/admin-auth.guard';
import { COMPLIANCE_AND_ABOVE } from '../common/decorators/admin-roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@ApiTags('Admin - KYC')
@Controller('admin/kyc')
@UseGuards(AdminAuthGuard)
@ApiBearerAuth('JWT-auth')
export class KycController {
  constructor(private readonly kycService: KycService) {}

  @Get('queue')
  @COMPLIANCE_AND_ABOVE
  @ApiOperation({ summary: 'Get KYC review queue' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'KYC queue retrieved successfully' })
  getKycQueue(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
  ) {
    return this.kycService.getKycQueue(page, limit);
  }

  @Get()
  @COMPLIANCE_AND_ABOVE
  @ApiOperation({ summary: 'Get all KYC submissions with filtering' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'kycStatus', required: false, enum: ['NOT_SUBMITTED', 'PENDING', 'APPROVED', 'REJECTED'] })
  @ApiQuery({ name: 'role', required: false, enum: ['BUYER', 'SELLER', 'BOTH'] })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @ApiResponse({ 
    status: 200, 
    description: 'KYC submissions retrieved successfully',
    type: PaginatedKycResponseDto
  })
  getKycSubmissions(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('search') search?: string,
    @Query('kycStatus') kycStatus?: 'NOT_SUBMITTED' | 'PENDING' | 'APPROVED' | 'REJECTED',
    @Query('role') role?: 'BUYER' | 'SELLER' | 'BOTH',
    @Query('isActive') isActive?: boolean,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    const kycListingDto: KycListingDto = {
      page,
      limit,
      search,
      kycStatus,
      role,
      isActive,
      sortBy,
      sortOrder,
    };
    return this.kycService.getKycSubmissions(kycListingDto);
  }

  @Post('approve')
  @COMPLIANCE_AND_ABOVE
  @ApiOperation({ summary: 'Approve a KYC submission' })
  @ApiResponse({ 
    status: 200, 
    description: 'KYC submission approved successfully',
    type: KycActionResponseDto
  })
  @ApiResponse({ status: 404, description: 'KYC submission not found' })
  @ApiResponse({ status: 400, description: 'KYC submission is not in pending status' })
  approveKyc(
    @Body() approveDto: KycApproveDto,
    @CurrentUser('id') adminId: string,
  ) {
    return this.kycService.approveKyc(approveDto, adminId);
  }

  @Post('reject')
  @COMPLIANCE_AND_ABOVE
  @ApiOperation({ summary: 'Reject a KYC submission' })
  @ApiResponse({ 
    status: 200, 
    description: 'KYC submission rejected successfully',
    type: KycActionResponseDto
  })
  @ApiResponse({ status: 404, description: 'KYC submission not found' })
  @ApiResponse({ status: 400, description: 'KYC submission is not in pending status' })
  rejectKyc(
    @Body() rejectDto: KycRejectDto,
    @CurrentUser('id') adminId: string,
  ) {
    return this.kycService.rejectKyc(rejectDto, adminId);
  }
}
