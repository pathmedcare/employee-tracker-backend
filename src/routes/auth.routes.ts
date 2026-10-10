import { Router } from 'express';
import {
  register,
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  getMe,
  registerDevice
} from '../controllers/auth.controller.js';
import {
  registerValidator,
  loginValidator,
  refreshValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  deviceRegisterValidator
} from '../validators/auth.validator.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

// Public Authentication Routes
router.post('/register', registerValidator, validate, register);
router.post('/login', loginValidator, validate, login);
router.post('/refresh', refreshValidator, validate, refreshToken);
router.post('/logout', logout);
router.post('/forgot-password', forgotPasswordValidator, validate, forgotPassword);
router.post('/reset-password', resetPasswordValidator, validate, resetPassword);

// Protected Auth & Profile Routes
router.get('/me', authenticate, getMe);
router.post('/devices/register', authenticate, deviceRegisterValidator, validate, registerDevice);

export default router;
