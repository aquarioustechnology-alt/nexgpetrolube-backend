import { SetMetadata } from '@nestjs/common';
import { AdminRole } from '@prisma/client';

export const ADMIN_ROLES_KEY = 'adminRoles';

export const AdminRoles = (...roles: AdminRole[]) => SetMetadata(ADMIN_ROLES_KEY, roles);

// Predefined admin role combinations for common use cases
export const SUPER_ADMIN_ONLY = AdminRoles('SUPER_ADMIN');
export const COMPLIANCE_AND_ABOVE = AdminRoles('SUPER_ADMIN', 'COMPLIANCE');
export const MODERATOR_AND_ABOVE = AdminRoles('SUPER_ADMIN', 'COMPLIANCE', 'MODERATOR');
export const FINANCE_AND_ABOVE = AdminRoles('SUPER_ADMIN', 'COMPLIANCE', 'MODERATOR', 'FINANCE');
