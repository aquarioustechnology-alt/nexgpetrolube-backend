import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BidsService } from './bids.service';

@ApiTags('Bids')
@Controller('bids')
export class BidsController {
  constructor(private readonly bidsService: BidsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all bids' })
  @ApiResponse({ status: 200, description: 'Bids retrieved successfully' })
  findAll() {
    return this.bidsService.findAll();
  }
}
