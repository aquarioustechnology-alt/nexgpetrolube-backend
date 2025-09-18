import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsOptional, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class AddressDto {
  @ApiProperty({ description: 'Address line 1' })
  @IsString()
  line1: string;

  @ApiProperty({ description: 'Address line 2', required: false })
  @IsOptional()
  @IsString()
  line2?: string;

  @ApiProperty({ description: 'City' })
  @IsString()
  city: string;

  @ApiProperty({ description: 'State' })
  @IsString()
  state: string;

  @ApiProperty({ description: 'Country', default: 'India' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({ description: 'Pincode' })
  @IsString()
  pincode: string;
}

export class RegisterDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'password123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @ApiProperty({
    description: 'First name',
    example: 'John',
  })
  @IsString()
  firstName: string;

  @ApiProperty({
    description: 'Last name',
    example: 'Doe',
  })
  @IsString()
  lastName: string;

  @ApiProperty({
    description: 'Company name',
    example: 'Petro Solutions Inc.',
  })
  @IsString()
  companyName: string;

  @ApiProperty({
    description: 'Phone number',
    example: '+91 98765 43210',
    required: false,
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    description: 'User role',
    enum: ['BUYER', 'SELLER', 'BOTH'],
    default: 'BUYER',
    required: false,
  })
  @IsOptional()
  @IsEnum(['BUYER', 'SELLER', 'BOTH'])
  role?: 'BUYER' | 'SELLER' | 'BOTH';

  @ApiProperty({
    description: 'Company address',
    type: AddressDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;

  @ApiProperty({
    description: 'Delivery address',
    type: AddressDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  deliveryAddress?: AddressDto;

  @ApiProperty({
    description: 'GST number',
    required: false,
  })
  @IsOptional()
  @IsString()
  gstNumber?: string;

  @ApiProperty({
    description: 'PAN number',
    required: false,
  })
  @IsOptional()
  @IsString()
  panNumber?: string;

  @ApiProperty({
    description: 'Aadhaar number',
    required: false,
  })
  @IsOptional()
  @IsString()
  aadhaarNumber?: string;

  @ApiProperty({
    description: 'KYC status',
    enum: ['NOT_SUBMITTED', 'PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING',
    required: false,
  })
  @IsOptional()
  @IsEnum(['NOT_SUBMITTED', 'PENDING', 'APPROVED', 'REJECTED'])
  kycStatus?: 'NOT_SUBMITTED' | 'PENDING' | 'APPROVED' | 'REJECTED';

  @ApiProperty({
    description: 'Uploaded file filenames',
    required: false,
  })
  @IsOptional()
  uploadedFiles?: {
    authorizationLetter?: string;
    panDocument?: string;
    aadhaarDocument?: string;
    profilePicture?: string;
    gstCertificate?: string;
    companyRegistration?: string;
    bankStatement?: string;
    addressProof?: string;
  };
}
