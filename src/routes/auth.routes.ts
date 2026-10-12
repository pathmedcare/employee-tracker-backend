import { Router } from 'express';
import {
  login,
  requestLoginOtp,
  createUser,
  requestPasswordReset,
  verifyOtp,
  verifyPasswordResetOtp,
  resetPassword,
  getMe,
  registerDevice
} from '../controllers/auth.controller.js';
import {
  loginValidator,
  sendLoginOtpValidator,
  createUserValidator,
  requestPasswordResetValidator,
  verifyOtpValidator,
  verifyPasswordResetOtpValidator,
  resetPasswordValidator,
  deviceRegisterValidator
} from '../validators/auth.validator.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

// 1. Log In (Supports Password OR OTP)
router.post('/login', loginValidator, validate, login);

// 2. Sign Up / Create User
router.post('/users', createUserValidator, validate, createUser);
router.post('/users/client/:client_id', createUserValidator, validate, createUser);

// Request OTP (Password Reset & OTP)
router.post('/request-otp', requestPasswordResetValidator, validate, requestPasswordReset);
router.post('/request-password-reset', requestPasswordResetValidator, validate, requestPasswordReset);
router.post('/login-otp/send', sendLoginOtpValidator, validate, requestLoginOtp);

// 4. Verify OTP (Login via OTP)
router.post('/verify-otp', verifyOtpValidator, validate, verifyOtp);

// 5. Verify Password Reset OTP
router.post('/verify-password-reset-otp', verifyPasswordResetOtpValidator, validate, verifyPasswordResetOtp);

// 6. Reset Password
router.post('/reset-password', resetPasswordValidator, validate, resetPassword);

// User Profile & Device Registration
router.get('/me', authenticate, getMe);
router.post('/devices/register', authenticate, deviceRegisterValidator, validate, registerDevice);

export default router;
