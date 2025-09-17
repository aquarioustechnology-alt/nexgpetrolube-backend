import { ApiProperty } from '@nestjs/swagger';

export class BaseResponseDto {
  @ApiProperty({ description: 'Success status' })
  success: boolean;

  @ApiProperty({ description: 'Response message' })
  message: string;

  @ApiProperty({ description: 'Response data', required: false })
  data?: any;

  @ApiProperty({ description: 'Error details', required: false })
  error?: any;

  @ApiProperty({ description: 'Timestamp of the response' })
  timestamp: Date;

  constructor(success: boolean, message: string, data?: any, error?: any) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.error = error;
    this.timestamp = new Date();
  }

  static success(message: string, data?: any): BaseResponseDto {
    return new BaseResponseDto(true, message, data);
  }

  static error(message: string, error?: any): BaseResponseDto {
    return new BaseResponseDto(false, message, undefined, error);
  }
}

export class AdminAuditDto {
  @ApiProperty({ description: 'Admin user ID who performed the action' })
  adminId: string;

  @ApiProperty({ description: 'Admin user email' })
  adminEmail: string;

  @ApiProperty({ description: 'Action performed' })
  action: string;

  @ApiProperty({ description: 'Resource affected' })
  resource: string;

  @ApiProperty({ description: 'Resource ID' })
  resourceId: string;

  @ApiProperty({ description: 'Additional details', required: false })
  details?: any;

  @ApiProperty({ description: 'IP address of the request' })
  ipAddress: string;

  @ApiProperty({ description: 'User agent of the request' })
  userAgent: string;

  @ApiProperty({ description: 'Timestamp of the action' })
  timestamp: Date;
}
