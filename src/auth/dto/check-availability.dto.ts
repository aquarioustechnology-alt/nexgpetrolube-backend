import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CheckAvailabilityDto {
  @ApiProperty({
    description: 'Email address to check',
    example: 'user@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Phone number to check (optional)',
    example: '+911234567890',
    required: false,
  })
  @IsOptional()
  @IsString()
  phone?: string;
}

