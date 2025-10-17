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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PaymentMethodsService, PaymentMethod, Transaction } from './payment-methods.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Payment Methods')
@Controller('payment-methods')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class PaymentMethodsController {
  constructor(private readonly paymentMethodsService: PaymentMethodsService) {}

  @Get()
  @ApiOperation({ summary: 'Get user payment methods' })
  @ApiResponse({ status: 200, description: 'Payment methods retrieved successfully' })
  async getPaymentMethods(@CurrentUser() user: any): Promise<PaymentMethod[]> {
    return this.paymentMethodsService.getPaymentMethods(user.sub);
  }

  @Post()
  @ApiOperation({ summary: 'Add new payment method' })
  @ApiResponse({ status: 201, description: 'Payment method added successfully' })
  async addPaymentMethod(
    @CurrentUser() user: any,
    @Body() paymentMethodData: Partial<PaymentMethod>,
  ): Promise<PaymentMethod> {
    return this.paymentMethodsService.addPaymentMethod(user.sub, paymentMethodData);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update payment method' })
  @ApiResponse({ status: 200, description: 'Payment method updated successfully' })
  async updatePaymentMethod(
    @CurrentUser() user: any,
    @Param('id') paymentMethodId: string,
    @Body() updateData: Partial<PaymentMethod>,
  ): Promise<PaymentMethod> {
    return this.paymentMethodsService.updatePaymentMethod(user.sub, paymentMethodId, updateData);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete payment method' })
  @ApiResponse({ status: 200, description: 'Payment method deleted successfully' })
  async deletePaymentMethod(
    @CurrentUser() user: any,
    @Param('id') paymentMethodId: string,
  ): Promise<void> {
    return this.paymentMethodsService.deletePaymentMethod(user.sub, paymentMethodId);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Get user transactions' })
  @ApiResponse({ status: 200, description: 'Transactions retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getTransactions(
    @CurrentUser() user: any,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<{ transactions: Transaction[]; total: number; page: number; limit: number }> {
    return this.paymentMethodsService.getTransactions(user.sub, page, limit);
  }

  @Get('transactions/:id')
  @ApiOperation({ summary: 'Get transaction by ID' })
  @ApiResponse({ status: 200, description: 'Transaction retrieved successfully' })
  async getTransactionById(
    @CurrentUser() user: any,
    @Param('id') transactionId: string,
  ): Promise<Transaction> {
    return this.paymentMethodsService.getTransactionById(user.sub, transactionId);
  }
}
