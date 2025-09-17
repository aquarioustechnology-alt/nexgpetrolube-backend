import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AdminCommonModule } from '../common/common.module';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [AdminCommonModule, DatabaseModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
