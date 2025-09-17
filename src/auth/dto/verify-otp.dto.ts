import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, IsEmail, IsOptional } from 'class-validator';

export class VerifyOtpDto {
  @ApiProperty({
    description: 'Email address',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty({
    description: '6-digit OTP code',
    example: '123456',
    minLength: 6,
    maxLength: 6,
  })
  @IsString()
  @Length(6, 6, { message: 'OTP must be exactly 6 digits' })
  otp: string;

  @ApiProperty({
    description: 'Phone number (optional)',
    example: '+91 98765 43210',
    required: false,
  })
  @IsOptional()
  @IsString()
  phone?: string;
}
