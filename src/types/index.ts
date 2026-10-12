import { Request } from 'express';

export type UserRole = 'Employee' | 'Supervisor' | 'Admin' | string;
export type UserStatus = 'active' | 'inactive' | 'suspended' | string;
export type OtpPurpose = 'login' | 'reset_password';

export interface IUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  password_hash?: string;
  title?: string;
  gender?: string;
  middle_name?: string;
  country_code?: string;
  role_id?: string;
  employee_id?: string;
  status: UserStatus;
  creation_source?: string;
  login_attempts?: number;
  designation?: string;
  joining_date?: string | Date;
  official_email?: string;
  role?: string;
  manager?: any;
  shift?: any[];
  emergency_contact?: any;
  custom_fields?: any[];
  location_department?: any[];
  created_at?: Date;
  updated_at?: Date;
}

export interface IUserPublicResponse {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  status: string;
  title?: string;
  gender?: string;
  designation?: string;
  role?: string;
}

export interface IDevice {
  id: string;
  user_id: string;
  fcm_token: string;
  platform: string;
  updated_at: Date;
}

export interface IOtpRecord {
  id: string;
  phoneOrEmail: string;
  otp: string;
  purpose: OtpPurpose;
  expires_at: Date;
}

export interface AuthenticatedRequest extends Request {
  user?: IUserPublicResponse;
}

export interface TokenPayload {
  sub: string;
  phone: string;
  email: string;
  role?: string;
  iat?: number;
  exp?: number;
}

export interface AuthTokensResponse {
  success: boolean;
  message: string;
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

