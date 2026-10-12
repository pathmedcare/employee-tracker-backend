import { body } from 'express-validator';

export const loginValidator = [
  body('phone')
    .optional()
    .trim(),
  body('identifier')
    .optional()
    .trim(),
  body().custom((value) => {
    if (!value.phone && !value.identifier && !value.email) {
      throw new Error('Phone number is required');
    }
    if (!value.password && !value.otp) {
      throw new Error('Either password or otp is required to login');
    }
    return true;
  })
];

export const createUserValidator = [
  body('first_name')
    .trim()
    .notEmpty()
    .withMessage('first_name is required'),
  body('last_name')
    .trim()
    .notEmpty()
    .withMessage('last_name is required'),
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('phone is required'),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Must be a valid email address'),
  body('role')
    .optional()
    .trim(),
  body('designation')
    .optional()
    .trim()
];

export const requestPasswordResetValidator = [
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('phone is required')
];

export const sendLoginOtpValidator = [
  body('phone')
    .optional()
    .trim(),
  body('identifier')
    .optional()
    .trim(),
  body().custom((value) => {
    if (!value.phone && !value.identifier) {
      throw new Error('Phone or identifier is required');
    }
    return true;
  })
];

export const verifyOtpValidator = [
  body('phone')
    .optional()
    .trim(),
  body('identifier')
    .optional()
    .trim(),
  body().custom((value) => {
    if (!value.phone && !value.identifier && !value.email) {
      throw new Error('phone is required');
    }
    if (!value.otp && !value.password) {
      throw new Error('Either otp or password is required');
    }
    return true;
  })
];

export const verifyPasswordResetOtpValidator = [
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('phone is required'),
  body('otp')
    .trim()
    .notEmpty()
    .withMessage('otp is required')
];

export const resetPasswordValidator = [
  body('new_password')
    .notEmpty()
    .withMessage('new_password is required'),
  body().custom((value, { req }) => {
    const authHeader = req.headers?.authorization;
    const hasBearer = authHeader && authHeader.startsWith('Bearer ');
    if (!value.token && !value.reset_token && !hasBearer) {
      throw new Error('token is required');
    }
    if (value.confirm_password && value.confirm_password !== value.new_password) {
      throw new Error('confirm_password does not match new_password');
    }
    return true;
  })
];

export const deviceRegisterValidator = [
  body('fcm_token')
    .notEmpty()
    .withMessage('fcm_token is required'),
  body('platform')
    .optional()
    .isIn(['android', 'ios', 'web'])
    .withMessage('Platform must be android, ios, or web')
];
