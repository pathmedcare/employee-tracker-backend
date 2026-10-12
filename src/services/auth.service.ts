import jwt from 'jsonwebtoken';
import { User, CreateUserInput } from '../models/User.js';
import { Device } from '../models/Device.js';
import { OtpService } from './otp.service.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { AuthTokensResponse, IDevice, IUserPublicResponse, TokenPayload } from '../types/index.js';

const activeRefreshTokens = new Set<string>();
const passwordResetTokens = new Map<string, string>();

export class AuthService {
  /**
   * 1. Log In (Password Login)
   */
  public static async login(phoneOrEmail: string, password: string): Promise<AuthTokensResponse> {
    logger.info(`🔍 [AUTH LOGIN] Looking up user with identifier: "${phoneOrEmail}"`);
    const user = await User.findByPhoneOrEmail(phoneOrEmail);
    
    if (!user) {
      logger.warn(`❌ [AUTH LOGIN FAILED] No user account found for phone/email: "${phoneOrEmail}"`);
      throw { statusCode: 401, message: 'Invalid phone or password' };
    }

    logger.info(`👤 [AUTH LOGIN] Found user ID: ${user.id} (${user.first_name} ${user.last_name}), status: "${user.status}"`);

    const isMatch = User.verifyPassword(password, user.password_hash || '');
    if (!isMatch) {
      logger.warn(`❌ [AUTH LOGIN FAILED] Password mismatch for user phone/email: "${phoneOrEmail}"`);
      throw { statusCode: 401, message: 'Invalid phone or password' };
    }

    if (user.status && user.status.toLowerCase() !== 'active') {
      logger.warn(`❌ [AUTH LOGIN FAILED] User account is not active (status: "${user.status}")`);
      throw { statusCode: 403, message: 'Account is inactive' };
    }

    logger.info(`✅ [AUTH LOGIN SUCCESS] Password verified for user ID: ${user.id}`);
    return this.generateAuthResponse(user);
  }

  /**
   * 2. Sign Up / Create User
   */
  public static async createUser(userData: CreateUserInput): Promise<IUserPublicResponse> {
    logger.info(`👤 [CREATE USER] Creating user with phone: "${userData.phone}", name: "${userData.first_name} ${userData.last_name}"`);
    const existingUser = await User.findByPhoneOrEmail(userData.phone);
    if (existingUser) {
      logger.warn(`❌ [CREATE USER FAILED] Phone number "${userData.phone}" already registered`);
      throw { statusCode: 400, message: 'Phone number already registered' };
    }

    const newUser = await User.create(userData);
    logger.info(`✅ [CREATE USER SUCCESS] Created new user ID: ${newUser.id}`);
    return User.toPublicResponse(newUser);
  }

  /**
   * Request OTP for Login
   */
  public static async requestLoginOtp(phone: string): Promise<{
    success: boolean;
    message: string;
    phone: string;
    otp?: string;
  }> {
    logger.info(`📲 [REQUEST LOGIN OTP] Generating login OTP for phone: "${phone}"`);
    const user = await User.findByPhoneOrEmail(phone);
    if (!user) {
      throw { statusCode: 404, message: 'User not found with provided phone number. Please sign up first.' };
    }

    const otp = OtpService.generateOtp(phone, 'login');
    logger.info(`🔑 [LOGIN OTP GENERATED] OTP "${otp}" generated for phone: "${phone}"`);

    return {
      success: true,
      message: 'Login OTP sent successfully',
      phone,
      otp
    };
  }

  /**
   * 3. Request OTP (Password Reset)
   */
  public static async requestPasswordReset(phone: string): Promise<{
    success: boolean;
    message: string;
    phone: string;
    otpPhone: string;
  }> {
    const formattedPhone = phone.trim();
    logger.info(`🔑 [REQUEST RESET OTP] Looking up user with phone: "${formattedPhone}"`);
    let user = await User.findByPhoneOrEmail(formattedPhone);
    if (!user) {
      if (env.nodeEnv !== 'production') {
        logger.info(`🌱 [DEV AUTO-CREATE] Auto-creating user profile for phone "${formattedPhone}" during password reset request`);
        user = await User.create({
          first_name: 'Rahul',
          last_name: 'Wale',
          phone: formattedPhone,
          email: `${formattedPhone}@company.com`,
          role: 'Employee',
          designation: 'Software Developer',
          status: 'active'
        });
      } else {
        logger.warn(`❌ [REQUEST RESET OTP FAILED] User not found for phone: "${formattedPhone}"`);
        throw { statusCode: 404, message: 'User not found with provided phone number' };
      }
    }

    const otp = OtpService.generateOtp(formattedPhone, 'reset_password');
    logger.info(`📲 [REQUEST RESET OTP SUCCESS] OTP "${otp}" generated for phone: "${formattedPhone}"`);

    return {
      success: true,
      message: 'Password reset OTP sent successfully',
      phone: formattedPhone,
      otpPhone: formattedPhone
    };
  }

  /**
   * 4. Verify OTP (Login via OTP)
   */
  public static async verifyOtp(phone: string, otp: string): Promise<AuthTokensResponse> {
    logger.info(`🔑 [VERIFY LOGIN OTP] Verifying OTP "${otp}" for phone: "${phone}"`);
    const isValid = OtpService.verifyOtp(phone, otp, 'login');
    if (!isValid) {
      logger.warn(`❌ [VERIFY LOGIN OTP FAILED] Invalid or expired OTP "${otp}" for phone: "${phone}"`);
      throw { statusCode: 401, message: 'Invalid or expired OTP' };
    }

    let user = await User.findByPhoneOrEmail(phone);
    if (!user) {
      if (env.nodeEnv !== 'production') {
        logger.info(`🌱 [DEV AUTO-CREATE] Auto-creating user profile for phone "${phone}" during dev OTP login`);
        user = await User.create({
          first_name: 'Rahul',
          last_name: 'Wale',
          phone,
          email: `${phone}@company.com`,
          role: 'Employee',
          designation: 'Software Developer',
          status: 'active'
        });
      } else {
        logger.warn(`❌ [VERIFY LOGIN OTP FAILED] User not found for phone: "${phone}"`);
        throw { statusCode: 404, message: 'User not found' };
      }
    }

    logger.info(`✅ [VERIFY LOGIN OTP SUCCESS] OTP verified for user ID: ${user.id}`);
    return this.generateAuthResponse(user);
  }

  /**
   * 5. Verify Password Reset OTP
   */
  public static async verifyPasswordResetOtp(phone: string, otp: string): Promise<{
    success: boolean;
    message: string;
    reset_token: string;
  }> {
    const formattedPhone = phone.trim();
    logger.info(`🔑 [VERIFY RESET OTP] Verifying password reset OTP "${otp}" for phone: "${formattedPhone}"`);
    const isValid = OtpService.verifyOtp(formattedPhone, otp, 'reset_password');
    if (!isValid) {
      logger.warn(`❌ [VERIFY RESET OTP FAILED] Invalid or expired reset OTP "${otp}" for phone: "${formattedPhone}"`);
      throw { statusCode: 401, message: 'Invalid or expired OTP' };
    }

    let user = await User.findByPhoneOrEmail(formattedPhone);
    if (!user) {
      if (env.nodeEnv !== 'production') {
        logger.info(`🌱 [DEV AUTO-CREATE] Auto-creating user profile for phone "${formattedPhone}" during verify reset OTP`);
        user = await User.create({
          first_name: 'Rahul',
          last_name: 'Wale',
          phone: formattedPhone,
          email: `${formattedPhone}@company.com`,
          role: 'Employee',
          designation: 'Software Developer',
          status: 'active'
        });
      } else {
        logger.warn(`❌ [VERIFY RESET OTP FAILED] User not found for phone: "${formattedPhone}"`);
        throw { statusCode: 404, message: 'User not found' };
      }
    }

    const reset_token = jwt.sign({ sub: user.id, phone: user.phone }, env.jwtSecret, {
      expiresIn: '15m'
    });

    passwordResetTokens.set(reset_token, user.id);
    logger.info(`✅ [VERIFY RESET OTP SUCCESS] Issued reset_token for user ID: ${user.id}`);

    return {
      success: true,
      message: 'OTP verified successfully',
      reset_token
    };
  }

  /**
   * 6. Reset Password
   */
  public static async resetPassword(token: string, newPassword: string): Promise<{
    success: boolean;
    message: string;
  }> {
    logger.info(`🔑 [RESET PASSWORD] Attempting password reset with token...`);
    try {
      const decoded = jwt.verify(token, env.jwtSecret) as TokenPayload;
      const userId = decoded.sub;

      const user = await User.findById(userId);
      if (!user) {
        logger.warn(`❌ [RESET PASSWORD FAILED] User ID ${userId} not found`);
        throw { statusCode: 400, message: 'Invalid reset token' };
      }

      await User.updatePassword(userId, newPassword);
      passwordResetTokens.delete(token);

      logger.info(`✅ [RESET PASSWORD SUCCESS] Password reset successfully for user ID: ${user.id}`);
      return {
        success: true,
        message: 'Password reset successfully'
      };
    } catch {
      logger.warn(`❌ [RESET PASSWORD FAILED] Token verification failed`);
      throw { statusCode: 400, message: 'Invalid or expired reset token' };
    }
  }

  private static generateAuthResponse(user: any): AuthTokensResponse {
    const payload: TokenPayload = {
      sub: user.id,
      phone: user.phone,
      email: user.email,
      role: user.role
    };

    const access_token = jwt.sign(payload, env.jwtSecret, { expiresIn: '24h' });
    const refresh_token = jwt.sign(payload, env.jwtRefreshSecret, { expiresIn: '7d' });

    activeRefreshTokens.add(refresh_token);

    return {
      success: true,
      message: 'User logged in successfully',
      access_token,
      refresh_token,
      expires_in: 86400
    };
  }

  public static async registerDevice(userId: string, fcmToken: string, platform?: string): Promise<IDevice> {
    return await Device.registerDevice({
      user_id: userId,
      fcm_token: fcmToken,
      platform
    });
  }
}
