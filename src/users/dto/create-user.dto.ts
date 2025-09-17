import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsOptional, IsEnum, IsBoolean } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

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
  })
  @IsEnum(['BUYER', 'SELLER', 'BOTH'])
  role: 'BUYER' | 'SELLER' | 'BOTH';

  @ApiProperty({
    description: 'Whether the user is active',
    default: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    description: 'Whether the email is verified',
    default: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isEmailVerified?: boolean;

  @ApiProperty({
    description: 'Whether the phone is verified',
    default: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isPhoneVerified?: boolean;

  @ApiProperty({
    description: 'Profile image URL',
    required: false,
  })
  @IsOptional()
  @IsString()
  profileImage?: string;
}
