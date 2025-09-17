import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { KycService } from './kyc.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('KYC')
@Controller('kyc')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class KycController {
  constructor(private readonly kycService: KycService) {}

  @Post('submit')
  @ApiOperation({ summary: 'Submit KYC documents' })
  @ApiResponse({ status: 201, description: 'KYC submitted successfully' })
  submitKyc(@CurrentUser() user: any, @Body() kycData: any) {
    return this.kycService.submitKyc(user.sub, kycData);
  }

  @Get('status')
  @ApiOperation({ summary: 'Get KYC status' })
  @ApiResponse({ status: 200, description: 'KYC status retrieved successfully' })
  getKycStatus(@CurrentUser() user: any) {
    return this.kycService.getKycStatus(user.sub);
  }
}
