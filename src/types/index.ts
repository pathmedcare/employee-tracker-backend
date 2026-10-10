import { Request } from 'express';

export type UserRole = 'Employee' | 'Supervisor' | 'Admin';
export type UserStatus = 'Active' | 'Inactive' | 'Suspended';

export interface IUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  password_hash: string;
  role: UserRole;
  department_id?: string | null;
  photo_url?: string | null;
  status: UserStatus;
  created_at: Date;
  updated_at: Date;
}

export type IUserWithoutPassword = Omit<IUser, 'password_hash'>;

export interface IDevice {
  id: string;
  user_id: string;
  fcm_token: string;
  platform: string;
  updated_at: Date;
}

export interface AuthenticatedRequest extends Request {
  user?: IUserWithoutPassword;
}

export interface TokenPayload {
  sub: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}
