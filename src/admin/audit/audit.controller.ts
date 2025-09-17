import {
  Controller,
  Get,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { AuditLogListingDto, PaginatedAuditLogResponseDto } from './dto/audit-log.dto';
import { AdminAuthGuard } from '../common/guards/admin-auth.guard';
import { SUPER_ADMIN_ONLY } from '../common/decorators/admin-roles.decorator';

@ApiTags('Admin - Audit')
@Controller('admin/audit')
@UseGuards(AdminAuthGuard)
@ApiBearerAuth('JWT-auth')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('logs')
  @SUPER_ADMIN_ONLY
  @ApiOperation({ summary: 'Get audit logs with filtering' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'action', required: false, type: String })
  @ApiQuery({ name: 'entity', required: false, type: String })
  @ApiQuery({ name: 'userId', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @ApiResponse({ 
    status: 200, 
    description: 'Audit logs retrieved successfully',
    type: PaginatedAuditLogResponseDto
  })
  getAuditLogs(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('search') search?: string,
    @Query('action') action?: string,
    @Query('entity') entity?: string,
    @Query('userId') userId?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    const auditLogListingDto: AuditLogListingDto = {
      page,
      limit,
      search,
      action,
      entity,
      userId,
      sortBy,
      sortOrder,
    };
    return this.auditService.getAuditLogs(auditLogListingDto);
  }

  @Get()
  @SUPER_ADMIN_ONLY
  @ApiOperation({ summary: 'Get audit logs (simple)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Audit logs retrieved successfully' })
  getAuditLogsSimple(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
  ) {
    return this.auditService.getAuditLogsSimple(page, limit);
  }
}
