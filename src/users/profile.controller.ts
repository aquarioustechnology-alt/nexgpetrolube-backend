import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ProfileService } from './profile.service';
import { ProfileResponseDto } from './dto/profile-response.dto';
import { UpdatePersonalInfoDto, UpdateAddressDto, UpdateKycDto, UpdateBankDetailsDto } from './dto/profile-update.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Profile')
@Controller('profile')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully', type: ProfileResponseDto })
  async getProfile(@CurrentUser() user: any): Promise<ProfileResponseDto> {
    return this.profileService.getProfile(user.sub);
  }

  @Put('personal-info')
  @ApiOperation({ summary: 'Update personal information' })
  @ApiResponse({ status: 200, description: 'Personal information updated successfully', type: ProfileResponseDto })
  async updatePersonalInfo(
    @CurrentUser() user: any,
    @Body() updateData: UpdatePersonalInfoDto,
  ): Promise<ProfileResponseDto> {
    return this.profileService.updatePersonalInfo(user.sub, updateData);
  }

  @Post('addresses')
  @ApiOperation({ summary: 'Add new address' })
  @ApiResponse({ status: 200, description: 'Address added successfully', type: ProfileResponseDto })
  async addAddress(
    @CurrentUser() user: any,
    @Body() addressData: UpdateAddressDto,
  ): Promise<ProfileResponseDto> {
    return this.profileService.addAddress(user.sub, addressData);
  }

  @Put('addresses/:addressId')
  @ApiOperation({ summary: 'Update address' })
  @ApiResponse({ status: 200, description: 'Address updated successfully', type: ProfileResponseDto })
  async updateAddress(
    @CurrentUser() user: any,
    @Param('addressId') addressId: string,
    @Body() updateData: UpdateAddressDto,
  ): Promise<ProfileResponseDto> {
    return this.profileService.updateAddress(user.sub, addressId, updateData);
  }

  @Delete('addresses/:addressId')
  @ApiOperation({ summary: 'Delete address' })
  @ApiResponse({ status: 200, description: 'Address deleted successfully', type: ProfileResponseDto })
  async deleteAddress(
    @CurrentUser() user: any,
    @Param('addressId') addressId: string,
  ): Promise<ProfileResponseDto> {
    return this.profileService.deleteAddress(user.sub, addressId);
  }

  @Put('kyc')
  @ApiOperation({ summary: 'Update KYC information' })
  @ApiResponse({ status: 200, description: 'KYC information updated successfully', type: ProfileResponseDto })
  async updateKyc(
    @CurrentUser() user: any,
    @Body() kycData: UpdateKycDto,
  ): Promise<ProfileResponseDto> {
    return this.profileService.updateKyc(user.sub, kycData);
  }

  @Put('bank-details')
  @ApiOperation({ summary: 'Update bank details' })
  @ApiResponse({ status: 200, description: 'Bank details updated successfully', type: ProfileResponseDto })
  async updateBankDetails(
    @CurrentUser() user: any,
    @Body() bankData: UpdateBankDetailsDto,
  ): Promise<ProfileResponseDto> {
    return this.profileService.updateBankDetails(user.sub, bankData);
  }
}
