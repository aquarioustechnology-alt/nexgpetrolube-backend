import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, IsOptional, ValidateIf } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'User email address or phone number',
    example: 'user@example.com or 9876543210',
    required: false,
  })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({
    description: 'User phone number',
    example: '+919876543210',
    required: false,
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    description: 'User password',
    example: 'password123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;
}
