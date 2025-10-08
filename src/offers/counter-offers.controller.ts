import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query, 
  UseGuards, 
  Request,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CounterOffersService } from './counter-offers.service';
import { 
  CreateCounterOfferDto, 
  UpdateCounterOfferDto, 
  CounterOfferResponseDto, 
  AcceptCounterOfferDto,
  RejectCounterOfferDto,
  CounterOfferListResponseDto 
} from './dto/counter-offer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Counter Offers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('counter-offers')
export class CounterOffersController {
  constructor(private readonly counterOffersService: CounterOffersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new counteroffer' })
  @ApiResponse({
    status: 201,
    description: 'Counteroffer created successfully',
    type: CounterOfferResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data or business rules violated' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not authorized to make counteroffers' })
  @ApiResponse({ status: 404, description: 'Offer not found' })
  async createCounterOffer(
    @Body() createCounterOfferDto: CreateCounterOfferDto,
    @Request() req: any
  ): Promise<CounterOfferResponseDto> {
    return this.counterOffersService.createCounterOffer(createCounterOfferDto, req.user.id);
  }

  @Get('offer/:offerId')
  @ApiOperation({ summary: 'Get all counteroffers for a specific offer' })
  @ApiResponse({
    status: 200,
    description: 'Counteroffers retrieved successfully',
    type: [CounterOfferResponseDto],
  })
  @ApiResponse({ status: 404, description: 'Offer not found' })
  async getCounterOffersByOffer(
    @Param('offerId') offerId: string
  ): Promise<CounterOfferResponseDto[]> {
    return this.counterOffersService.getCounterOffersByOffer(offerId);
  }

  @Get('requirement/:requirementId')
  @ApiOperation({ summary: 'Get all counteroffers for a specific requirement' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10)' })
  @ApiResponse({
    status: 200,
    description: 'Counteroffers retrieved successfully',
    type: CounterOfferListResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Requirement not found' })
  async getCounterOffersByRequirement(
    @Param('requirementId') requirementId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number
  ): Promise<CounterOfferListResponseDto> {
    return this.counterOffersService.getCounterOffersByRequirement(
      requirementId, 
      page || 1, 
      limit || 10
    );
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a counteroffer' })
  @ApiResponse({
    status: 200,
    description: 'Counteroffer updated successfully',
    type: CounterOfferResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data or counteroffer expired' })
  @ApiResponse({ status: 403, description: 'Forbidden - Can only update own counteroffers' })
  @ApiResponse({ status: 404, description: 'Counteroffer not found' })
  async updateCounterOffer(
    @Param('id') counterOfferId: string,
    @Body() updateCounterOfferDto: UpdateCounterOfferDto,
    @Request() req: any
  ): Promise<CounterOfferResponseDto> {
    return this.counterOffersService.updateCounterOffer(
      counterOfferId, 
      updateCounterOfferDto, 
      req.user.id
    );
  }

  @Post('accept')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Accept a counteroffer' })
  @ApiResponse({
    status: 200,
    description: 'Counteroffer accepted successfully',
    type: CounterOfferResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - Counteroffer expired or not pending' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not authorized to accept this counteroffer' })
  @ApiResponse({ status: 404, description: 'Counteroffer not found' })
  async acceptCounterOffer(
    @Body() acceptCounterOfferDto: AcceptCounterOfferDto,
    @Request() req: any
  ): Promise<CounterOfferResponseDto> {
    return this.counterOffersService.acceptCounterOffer(acceptCounterOfferDto, req.user.id);
  }

  @Post('reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject a counteroffer' })
  @ApiResponse({
    status: 200,
    description: 'Counteroffer rejected successfully',
    type: CounterOfferResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - Counteroffer not pending' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not authorized to reject this counteroffer' })
  @ApiResponse({ status: 404, description: 'Counteroffer not found' })
  async rejectCounterOffer(
    @Body() rejectCounterOfferDto: RejectCounterOfferDto,
    @Request() req: any
  ): Promise<CounterOfferResponseDto> {
    return this.counterOffersService.rejectCounterOffer(rejectCounterOfferDto, req.user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a counteroffer' })
  @ApiResponse({
    status: 204,
    description: 'Counteroffer deleted successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request - Cannot delete non-pending counteroffers' })
  @ApiResponse({ status: 403, description: 'Forbidden - Can only delete own counteroffers' })
  @ApiResponse({ status: 404, description: 'Counteroffer not found' })
  async deleteCounterOffer(
    @Param('id') counterOfferId: string,
    @Request() req: any
  ): Promise<void> {
    return this.counterOffersService.deleteCounterOffer(counterOfferId, req.user.id);
  }

  @Post('expire')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Expire all pending counteroffers that have passed their expiration time' })
  @ApiResponse({
    status: 200,
    description: 'Expired counteroffers updated successfully',
  })
  async expireCounterOffers(): Promise<void> {
    return this.counterOffersService.expireCounterOffers();
  }
}
