import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, Matches } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({ 
    description: 'Email address or mobile number to send reset OTP',
    example: 'user@example.com or 9876543210'
  })
  @IsString()
  emailOrMobile: string;
}

export class VerifyResetOtpDto {
  @ApiProperty({ 
    description: 'Email address or mobile number',
    example: 'user@example.com or 9876543210'
  })
  @IsString()
  emailOrMobile: string;

  @ApiProperty({ 
    description: '6-digit OTP received for password reset',
    example: '123456'
  })
  @IsString()
  @Matches(/^\d{6}$/, { message: 'OTP must be a 6-digit number' })
  otp: string;
}

export class ResetPasswordDto {
  @ApiProperty({ 
    description: 'Email address or mobile number',
    example: 'user@example.com or 9876543210'
  })
  @IsString()
  emailOrMobile: string;

  @ApiProperty({ 
    description: '6-digit OTP received for password reset',
    example: '123456'
  })
  @IsString()
  @Matches(/^\d{6}$/, { message: 'OTP must be a 6-digit number' })
  otp: string;

  @ApiProperty({ 
    description: 'New password (minimum 8 characters)',
    example: 'newpassword123',
    minLength: 8
  })
  @IsString()
  @Matches(/^.{8,}$/, {
    message: 'Password must be at least 8 characters long'
  })
  newPassword: string;
}
