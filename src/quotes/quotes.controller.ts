import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { QuotesService } from './quotes.service';

@ApiTags('Quotes')
@Controller('quotes')
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all quotes' })
  @ApiResponse({ status: 200, description: 'Quotes retrieved successfully' })
  findAll() {
    return this.quotesService.findAll();
  }
}
