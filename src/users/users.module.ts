import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { PaymentMethodsController } from './payment-methods.controller';
import { PaymentMethodsService } from './payment-methods.service';

@Module({
  controllers: [UsersController, ProfileController, PaymentMethodsController],
  providers: [UsersService, ProfileService, PaymentMethodsService],
  exports: [UsersService, ProfileService, PaymentMethodsService],
})
export class UsersModule {}
