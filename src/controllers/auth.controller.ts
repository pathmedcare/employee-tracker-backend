import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service.js';
import { AuthenticatedRequest } from '../types/index.js';

/**
 * 1. Log In
 * POST /api/v1/auth/login or /auth/api/auth/login
 */
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { phone, identifier, email, password, otp } = req.body;
    const loginPhone = phone || identifier || email;

    if (otp) {
      const result = await AuthService.verifyOtp(loginPhone, otp);
      res.status(200).json(result);
    } else {
      const result = await AuthService.login(loginPhone, password);
      res.status(200).json(result);
    }
  } catch (error) {
    next(error);
  }
};

/**
 * 2. Sign Up / Create User
 * POST /api/v1/users or /auth/api/users
 */
export const createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await AuthService.createUser(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const requestLoginOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { phone, identifier } = req.body;
    const targetPhone = phone || identifier;
    const result = await AuthService.requestLoginOtp(targetPhone);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * 3. Request OTP (Password Reset)
 * POST /api/v1/auth/request-password-reset
 */
export const requestPasswordReset = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { phone } = req.body;
    const result = await AuthService.requestPasswordReset(phone);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * 4. Verify OTP (Login via OTP)
 * POST /api/v1/auth/verify-otp
 */
export const verifyOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { phone, identifier, email, otp, password } = req.body;
    const loginPhone = phone || identifier || email;

    if (otp) {
      const result = await AuthService.verifyOtp(loginPhone, otp);
      res.status(200).json(result);
    } else if (password) {
      const result = await AuthService.login(loginPhone, password);
      res.status(200).json(result);
    } else {
      res.status(400).json({ success: false, message: 'Either otp or password is required' });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * 5. Verify Password Reset OTP
 * POST /api/v1/auth/verify-password-reset-otp
 */
export const verifyPasswordResetOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { phone, otp } = req.body;
    const result = await AuthService.verifyPasswordResetOtp(phone, otp);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * 6. Reset Password
 * POST /api/v1/auth/reset-password
 */
export const resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    const { token, reset_token, new_password, confirm_password } = req.body;
    if (confirm_password && confirm_password !== new_password) {
      res.status(400).json({ success: false, message: 'Passwords do not match' });
      return;
    }
    const targetToken = token || reset_token || bearerToken;
    if (!targetToken) {
      res.status(400).json({ success: false, message: 'Reset token is required in body (token) or Bearer authorization header' });
      return;
    }
    const result = await AuthService.resetPassword(targetToken, new_password);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    next(error);
  }
};

export const registerDevice = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { fcm_token, platform } = req.body;
    const device = await AuthService.registerDevice(userId, fcm_token, platform);
    res.status(201).json({ success: true, device });
  } catch (error) {
    next(error);
  }
};
