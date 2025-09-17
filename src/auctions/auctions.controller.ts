import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuctionsService } from './auctions.service';

@ApiTags('Auctions')
@Controller('auctions')
export class AuctionsController {
  constructor(private readonly auctionsService: AuctionsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all auctions' })
  @ApiResponse({ status: 200, description: 'Auctions retrieved successfully' })
  findAll() {
    return this.auctionsService.findAll();
  }
}
