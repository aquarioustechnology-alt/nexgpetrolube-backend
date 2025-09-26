import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OffersService } from './offers.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferStatusDto, CounterOfferDto } from './dto/update-offer.dto';
import { GetOffersQueryDto, GetOfferHistoryQueryDto, GetOfferNotificationsQueryDto } from './dto/get-offers.dto';

@Controller('offers')
@UseGuards(JwtAuthGuard)
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

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

  @Put(':id/status')
  async updateOfferStatus(
    @Param('id') id: string,
    @Request() req,
    @Body() updateDto: UpdateOfferStatusDto,
  ) {
    return this.offersService.updateOfferStatus(id, req.user.sub, updateDto);
  }

  @Post(':id/counter')
  async createCounterOffer(
    @Param('id') id: string,
    @Request() req,
    @Body() counterOfferDto: CounterOfferDto,
  ) {
    return this.offersService.createCounterOffer(id, req.user.sub, counterOfferDto);
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
}
