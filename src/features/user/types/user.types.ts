export type UserRole = 'ADMIN' | 'STAFF' | 'USER';

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'DELETED';

export interface AdminUser {
  id: string;
  email: string;
  phone?: string | null;
  firstName: string;
  lastName: string;
  avatar?: string | null;
  status: UserStatus;
  role: UserRole;
  loginAttempts: number;
  lockedUntil?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUserListParams {
  page?: number;
  limit?: number;
  role?: UserRole;
  status?: UserStatus;
  search?: string;
}

export interface CreateStaffRequest {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  phone?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  resource: string;
  resourceId: string;
  performedBy: string;
  changes?: Record<string, unknown>;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface AuditLogParams {
  page?: number;
  limit?: number;
  action?: string;
  resource?: string;
  performedBy?: string;
  startDate?: string;
  endDate?: string;
}
