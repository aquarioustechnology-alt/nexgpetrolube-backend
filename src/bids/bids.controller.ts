import { Controller, Post, Get, Body, Request, UseGuards, BadRequestException, Param, Query, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BidsService } from './bids.service';
import { CreateBidDto, BidResponseDto } from './dto/create-bid.dto';

@ApiTags('Bids')
@Controller('bids')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BidsController {
  constructor(private readonly bidsService: BidsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new bid' })
  @ApiResponse({ status: 201, description: 'Bid created successfully', type: BidResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createBid(@Body() createBidDto: CreateBidDto, @Request() req) {
    return this.bidsService.createBid(createBidDto, req.user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'Get all bids' })
  @ApiResponse({ status: 200, description: 'Bids retrieved successfully', type: [BidResponseDto] })
  async findAll() {
    return this.bidsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get bid by ID' })
  @ApiResponse({ status: 200, description: 'Bid retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Bid not found' })
  async getBidById(@Param('id') id: string) {
    return this.bidsService.getBidById(id);
  }

  @Get('requirement/:requirementId')
  @ApiOperation({ summary: 'Get bids for a specific requirement' })
  @ApiResponse({ status: 200, description: 'Bids retrieved successfully', type: [BidResponseDto] })
  async getBidsByRequirement(@Param('requirementId') requirementId: string) {
    return this.bidsService.getBidsByRequirement(requirementId);
  }

  @Get('requirement/:requirementId/results')
  @ApiOperation({ summary: 'Get bid results for a specific requirement' })
  @ApiResponse({ status: 200, description: 'Bid results retrieved successfully', type: [BidResponseDto] })
  async getBidResults(@Param('requirementId') requirementId: string) {
    return this.bidsService.getBidResults(requirementId);
  }

  @Get('requirement/:requirementId/highest')
  @ApiOperation({ summary: 'Get highest bid for a specific requirement' })
  @ApiResponse({ status: 200, description: 'Highest bid retrieved successfully', type: BidResponseDto })
  async getHighestBid(@Param('requirementId') requirementId: string) {
    return this.bidsService.getHighestBid(requirementId);
  }

  @Get('requirement/:requirementId/lowest')
  @ApiOperation({ summary: 'Get lowest bid for a specific requirement' })
  @ApiResponse({ status: 200, description: 'Lowest bid retrieved successfully', type: BidResponseDto })
  async getLowestBid(@Param('requirementId') requirementId: string) {
    return this.bidsService.getLowestBid(requirementId);
  }

  @Get('user/my-bids')
  @ApiOperation({ summary: 'Get current user bids' })
  @ApiResponse({ status: 200, description: 'User bids retrieved successfully', type: [BidResponseDto] })
  async getMyBids(
    @Request() req,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('sortBy') sortBy: string = 'createdAt',
    @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'desc',
    @Query('postingType') postingType?: string
  ) {
    return this.bidsService.getMyBids(req.user.sub, { page, limit, sortBy, sortOrder, postingType });
  }

  @Put(':id/accept')
  @ApiOperation({ summary: 'Accept a bid' })
  @ApiResponse({ status: 200, description: 'Bid accepted successfully', type: BidResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Bid not found' })
  @ApiResponse({ status: 403, description: 'Unauthorized' })
  async acceptBid(
    @Param('id') bidId: string,
    @Request() req,
    @Body() body?: { notes?: string }
  ) {
    return this.bidsService.acceptBid(bidId, req.user.sub, body?.notes);
  }

  @Put(':id/reject')
  @ApiOperation({ summary: 'Reject a bid' })
  @ApiResponse({ status: 200, description: 'Bid rejected successfully', type: BidResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Bid not found' })
  @ApiResponse({ status: 403, description: 'Unauthorized' })
  async rejectBid(
    @Param('id') bidId: string,
    @Request() req,
    @Body() body?: { reason?: string }
  ) {
    return this.bidsService.rejectBid(bidId, req.user.sub, body?.reason);
  }

  @Put('requirement/:requirementId/allocate')
  @ApiOperation({ summary: 'Allocate bids to multiple suppliers' })
  @ApiResponse({ status: 200, description: 'Bids allocated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Requirement not found' })
  @ApiResponse({ status: 403, description: 'Unauthorized' })
  async allocateBids(
    @Param('requirementId') requirementId: string,
    @Body() body: { allocations: { [bidId: string]: number }; quantities?: { [bidId: string]: number } },
    @Request() req
  ) {
    return this.bidsService.allocateBids(requirementId, body.allocations, req.user.sub, body.quantities);
  }
}