import { Module } from '@nestjs/common';
import { AdminAuthGuard } from './guards/admin-auth.guard';
import { AdminRolesGuard } from './guards/admin-roles.guard';
import { AdminAuditInterceptor } from './interceptors/admin-audit.interceptor';

@Module({
  providers: [AdminAuthGuard, AdminRolesGuard, AdminAuditInterceptor],
  exports: [AdminAuthGuard, AdminRolesGuard, AdminAuditInterceptor],
})
export class AdminCommonModule {}
