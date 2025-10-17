import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEmail, IsEnum, IsDateString, IsNumber, Min, Max } from 'class-validator';

export class UpdatePersonalInfoDto {
  @ApiProperty({ description: 'First name', required: false })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ description: 'Last name', required: false })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({ description: 'Company name', required: false })
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiProperty({ description: 'Phone number', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ description: 'Profile image URL', required: false })
  @IsOptional()
  @IsString()
  profileImage?: string;

  @ApiProperty({ description: 'Date of birth', required: false })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiProperty({ description: 'Gender', enum: ['male', 'female', 'other'], required: false })
  @IsOptional()
  @IsEnum(['male', 'female', 'other'])
  gender?: string;

  @ApiProperty({ description: 'Account type', enum: ['individual', 'company', 'partnership'], required: false })
  @IsOptional()
  @IsEnum(['individual', 'company', 'partnership'])
  accountType?: string;
}

export class UpdateAddressDto {
  @ApiProperty({ description: 'Address type', required: false })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty({ description: 'Address line 1', required: false })
  @IsOptional()
  @IsString()
  line1?: string;

  @ApiProperty({ description: 'Address line 2', required: false })
  @IsOptional()
  @IsString()
  line2?: string;

  @ApiProperty({ description: 'City', required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ description: 'State', required: false })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty({ description: 'Country', required: false })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({ description: 'PIN/Postal code', required: false })
  @IsOptional()
  @IsString()
  pincode?: string;

  @ApiProperty({ description: 'Is default address', required: false })
  @IsOptional()
  isDefault?: boolean;
}

export class UpdateKycDto {
  @ApiProperty({ description: 'PAN number', required: false })
  @IsOptional()
  @IsString()
  panNumber?: string;

  @ApiProperty({ description: 'Aadhaar number', required: false })
  @IsOptional()
  @IsString()
  aadhaarNumber?: string;

  @ApiProperty({ description: 'GST number', required: false })
  @IsOptional()
  @IsString()
  gstNumber?: string;

  @ApiProperty({ description: 'Years in business', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  yearsInBusiness?: number;
}

export class UpdateBankDetailsDto {
  @ApiProperty({ description: 'Account number', required: false })
  @IsOptional()
  @IsString()
  accountNumber?: string;

  @ApiProperty({ description: 'IFSC code', required: false })
  @IsOptional()
  @IsString()
  ifscCode?: string;

  @ApiProperty({ description: 'Bank name', required: false })
  @IsOptional()
  @IsString()
  bankName?: string;

  @ApiProperty({ description: 'Account holder name', required: false })
  @IsOptional()
  @IsString()
  accountHolderName?: string;
}
