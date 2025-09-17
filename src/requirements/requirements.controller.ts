import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RequirementsService } from './requirements.service';

@ApiTags('Requirements')
@Controller('requirements')
export class RequirementsController {
  constructor(private readonly requirementsService: RequirementsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all requirements' })
  @ApiResponse({ status: 200, description: 'Requirements retrieved successfully' })
  findAll() {
    return this.requirementsService.findAll();
  }
}
