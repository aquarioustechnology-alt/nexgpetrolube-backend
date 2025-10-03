import { IsString, IsNumber, IsEnum, IsOptional, IsDateString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentDto {
  @ApiProperty({ description: 'Offer ID' })
  @IsString()
  offerId: string;

  @ApiProperty({ description: 'Payment type', enum: ['COMMISSION', 'COMPLETE_PAYMENT', 'REFUND', 'ADVANCE_PAYMENT'] })
  @IsEnum(['COMMISSION', 'COMPLETE_PAYMENT', 'REFUND', 'ADVANCE_PAYMENT'])
  paymentType: 'COMMISSION' | 'COMPLETE_PAYMENT' | 'REFUND' | 'ADVANCE_PAYMENT';

  @ApiProperty({ description: 'Payment amount' })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ description: 'Payment method', enum: ['UPI', 'CARD', 'NET_BANKING', 'WALLET', 'BANK_TRANSFER'] })
  @IsEnum(['UPI', 'CARD', 'NET_BANKING', 'WALLET', 'BANK_TRANSFER'])
  paymentMethod: 'UPI' | 'CARD' | 'NET_BANKING' | 'WALLET' | 'BANK_TRANSFER';

  @ApiProperty({ description: 'UTR number for bank transfers', required: false })
  @IsOptional()
  @IsString()
  utrNumber?: string;

  @ApiProperty({ description: 'Payment screenshot URL', required: false })
  @IsOptional()
  @IsString()
  paymentScreenshot?: string;

  @ApiProperty({ description: 'Payment notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
