import { Controller, Post, Get, Body, Request, UseGuards, BadRequestException, Param, Query } from '@nestjs/common';
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

  @Get('requirement/:requirementId')
  @ApiOperation({ summary: 'Get bids for a specific requirement' })
  @ApiResponse({ status: 200, description: 'Bids retrieved successfully', type: [BidResponseDto] })
  async getBidsByRequirement(@Param('requirementId') requirementId: string) {
    return this.bidsService.getBidsByRequirement(requirementId);
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
}