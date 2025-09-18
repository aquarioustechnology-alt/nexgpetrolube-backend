import { ApiProperty } from '@nestjs/swagger';

export class ApproveRequirementDto {
  @ApiProperty({ 
    description: 'Additional notes for approval',
    required: false,
    example: 'Approved after review'
  })
  notes?: string;
}
