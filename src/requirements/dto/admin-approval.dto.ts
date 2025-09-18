import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class ApproveRequirementDto {
  @ApiProperty({ description: 'Admin user ID who is approving', required: false })
  @IsOptional()
  @IsString()
  adminId?: string;
}

export class RejectRequirementDto {
  @ApiProperty({ description: 'Admin user ID who is rejecting', required: false })
  @IsOptional()
  @IsString()
  adminId?: string;

  @ApiProperty({ description: 'Reason for rejection' })
  @IsString()
  rejectionReason: string;
}
