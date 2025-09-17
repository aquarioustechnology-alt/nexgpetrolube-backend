import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class UpdateUserStatusDto {
  @ApiProperty({ 
    description: 'User account active status',
    example: true
  })
  @IsBoolean()
  @IsNotEmpty()
  isActive: boolean

  @ApiProperty({ 
    description: 'Reason for status change (optional)',
    example: 'Account suspended due to policy violation',
    required: false
  })
  @IsOptional()
  @IsString()
  reason?: string
}

export class UserStatusResponseDto {
  @ApiProperty({ description: 'User ID' })
  id: string

  @ApiProperty({ description: 'User email' })
  email: string

  @ApiProperty({ description: 'Company name' })
  companyName: string

  @ApiProperty({ description: 'Is user account active' })
  isActive: boolean

  @ApiProperty({ description: 'Date of status update' })
  updatedAt: Date

  @ApiProperty({ description: 'Status change reason', required: false })
  statusChangeReason?: string
}
