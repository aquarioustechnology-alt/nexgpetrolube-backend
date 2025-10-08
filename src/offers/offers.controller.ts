import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OffersService } from './offers.service';
import { CounterOffersService } from './counter-offers.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferStatusDto, CounterOfferDto, UpdateOfferDetailsDto } from './dto/update-offer.dto';
import { GetOffersQueryDto, GetOfferHistoryQueryDto, GetOfferNotificationsQueryDto } from './dto/get-offers.dto';
import { 
  CreateCounterOfferDto, 
  UpdateCounterOfferDto, 
  AcceptCounterOfferDto,
  RejectCounterOfferDto 
} from './dto/counter-offer.dto';

@Controller('offers')
@UseGuards(JwtAuthGuard)
export class OffersController {
  constructor(
    private readonly offersService: OffersService,
    private readonly counterOffersService: CounterOffersService
  ) {}

  @Post()
  async createOffer(@Request() req, @Body() createOfferDto: CreateOfferDto) {
    return this.offersService.createOffer(req.user.sub, createOfferDto);
  }

  @Get()
  async getOffers(@Query() query: GetOffersQueryDto) {
    return this.offersService.getOffers(query);
  }

  @Get(':id')
  async getOfferById(@Param('id') id: string) {
    return this.offersService.getOfferById(id);
  }

  @Put(':id')
  async updateOfferDetails(
    @Param('id') id: string,
    @Request() req,
    @Body() updateDto: UpdateOfferDetailsDto,
  ) {
    return this.offersService.updateOfferDetails(id, req.user.sub, updateDto);
  }

  @Put(':id/status')
  async updateOfferStatus(
    @Param('id') id: string,
    @Request() req,
    @Body() updateDto: UpdateOfferStatusDto,
  ) {
    return this.offersService.updateOfferStatus(id, req.user.sub, updateDto);
  }

  @Put(':id/accept')
  async acceptOffer(
    @Param('id') id: string,
    @Request() req,
    @Body() body?: { notes?: string },
  ) {
    return this.offersService.updateOfferStatus(id, req.user.sub, {
      action: 'ACCEPTED' as any,
      notes: body?.notes,
    });
  }

  @Put(':id/reject')
  async rejectOffer(
    @Param('id') id: string,
    @Request() req,
    @Body() body?: { notes?: string },
  ) {
    return this.offersService.updateOfferStatus(id, req.user.sub, {
      action: 'REJECTED' as any,
      notes: body?.notes,
    });
  }


  @Get('history/list')
  async getOfferHistory(@Query() query: GetOfferHistoryQueryDto) {
    return this.offersService.getOfferHistory(query);
  }

  @Get('notifications/list')
  async getOfferNotifications(@Query() query: GetOfferNotificationsQueryDto) {
    return this.offersService.getOfferNotifications(query);
  }

  @Put('notifications/:notificationId/read')
  async markNotificationAsRead(
    @Param('notificationId') notificationId: string,
    @Request() req,
  ) {
    return this.offersService.markNotificationAsRead(notificationId, req.user.sub);
  }

  @Delete(':id')
  async deleteOffer(@Param('id') id: string, @Request() req) {
    return this.offersService.deleteOffer(id, req.user.sub);
  }

  // Additional endpoints for specific use cases
  @Get('requirement/:requirementId')
  async getOffersByRequirement(
    @Param('requirementId') requirementId: string,
    @Query() query: Omit<GetOffersQueryDto, 'requirementId'>,
  ) {
    return this.offersService.getOffers({ ...query, requirementId });
  }

  @Get('user/my-offers')
  async getMyOffers(@Request() req, @Query() query: Omit<GetOffersQueryDto, 'offerUserId'>) {
    return this.offersService.getOffers({ ...query, offerUserId: req.user.sub });
  }

  @Get('user/received-offers')
  async getReceivedOffers(@Request() req, @Query() query: Omit<GetOffersQueryDto, 'requirementOwnerId'>) {
    return this.offersService.getOffers({ ...query, requirementOwnerId: req.user.sub });
  }

  @Get('user/notifications')
  async getMyNotifications(@Request() req, @Query() query: Omit<GetOfferNotificationsQueryDto, 'recipientId'>) {
    return this.offersService.getOfferNotifications({ ...query, recipientId: req.user.sub });
  }

  // Counteroffer endpoints
  @Post('counter-offers')
  async createCounterOffer(@Request() req, @Body() createCounterOfferDto: CreateCounterOfferDto) {
    console.log('createCounterOffer - req.user:', req.user);
    console.log('createCounterOffer - req.user.sub:', req.user?.sub);
    
    if (!req.user || !req.user.sub) {
      throw new Error('User not authenticated');
    }
    
    return this.counterOffersService.createCounterOffer(createCounterOfferDto, req.user.sub);
  }

  @Get('counter-offers/offer/:offerId')
  async getCounterOffersByOffer(@Param('offerId') offerId: string) {
    return this.counterOffersService.getCounterOffersByOffer(offerId);
  }

  @Get('counter-offers/requirement/:requirementId')
  async getCounterOffersByRequirement(
    @Param('requirementId') requirementId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number
  ) {
    return this.counterOffersService.getCounterOffersByRequirement(requirementId, page || 1, limit || 10);
  }

  @Put('counter-offers/:id')
  async updateCounterOffer(
    @Param('id') counterOfferId: string,
    @Body() updateCounterOfferDto: UpdateCounterOfferDto,
    @Request() req
  ) {
    return this.counterOffersService.updateCounterOffer(counterOfferId, updateCounterOfferDto, req.user.sub);
  }

  @Post('counter-offers/accept')
  async acceptCounterOffer(@Request() req, @Body() acceptCounterOfferDto: AcceptCounterOfferDto) {
    return this.counterOffersService.acceptCounterOffer(acceptCounterOfferDto, req.user.sub);
  }

  @Post('counter-offers/reject')
  async rejectCounterOffer(@Request() req, @Body() rejectCounterOfferDto: RejectCounterOfferDto) {
    return this.counterOffersService.rejectCounterOffer(rejectCounterOfferDto, req.user.sub);
  }

  @Delete('counter-offers/:id')
  async deleteCounterOffer(@Param('id') counterOfferId: string, @Request() req) {
    return this.counterOffersService.deleteCounterOffer(counterOfferId, req.user.sub);
  }
}
