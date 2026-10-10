import { UserRole, UserStatus } from '../types/index.js';

export const ROLES: Record<string, UserRole> = {
  EMPLOYEE: 'Employee',
  SUPERVISOR: 'Supervisor',
  ADMIN: 'Admin'
};

export const USER_STATUS: Record<string, UserStatus> = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  SUSPENDED: 'Suspended'
};

export const JWT_CONFIG = {
  ACCESS_EXPIRATION: '15m',
  REFRESH_EXPIRATION: '7d',
  RESET_PASSWORD_EXPIRATION: '1h'
};
