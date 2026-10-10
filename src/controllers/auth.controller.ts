import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service.js';
import { sendSuccess } from '../utils/response.js';
import { AuthenticatedRequest } from '../types/index.js';

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await AuthService.register(req.body);
    sendSuccess(res, 'User registered successfully', result, 201);
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;
    const result = await AuthService.login(email, password);
    sendSuccess(res, 'Login successful', result, 200);
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { refreshToken: token } = req.body;
    const result = await AuthService.refreshToken(token);
    sendSuccess(res, 'Token refreshed successfully', result, 200);
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { refreshToken: token } = req.body;
    await AuthService.logout(token);
    sendSuccess(res, 'Logout successful', null, 200);
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = req.body;
    const result = await AuthService.forgotPassword(email);
    sendSuccess(res, result.message, result.resetToken ? { resetToken: result.resetToken } : null, 200);
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { resetToken, newPassword } = req.body;
    const result = await AuthService.resetPassword(resetToken, newPassword);
    sendSuccess(res, result.message, null, 200);
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    sendSuccess(res, 'Authenticated user profile retrieved', req.user, 200);
  } catch (error) {
    next(error);
  }
};

export const registerDevice = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { fcm_token, platform } = req.body;
    const device = await AuthService.registerDevice(userId, fcm_token, platform);
    sendSuccess(res, 'Device FCM token registered successfully', device, 201);
  } catch (error) {
    next(error);
  }
};
