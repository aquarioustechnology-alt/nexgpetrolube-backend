import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class RejectRequirementDto {
  @ApiProperty({ 
    description: 'Reason for rejection',
    example: 'Incomplete information provided'
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10, { message: 'Rejection reason must be at least 10 characters long' })
  rejectionReason: string;
}
