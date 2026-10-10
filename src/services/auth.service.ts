import jwt from 'jsonwebtoken';
import { User, CreateUserInput } from '../models/User.js';
import { Device } from '../models/Device.js';
import { env } from '../config/env.js';
import { JWT_CONFIG } from '../utils/constants.js';
import { AuthTokens, IDevice, IUserWithoutPassword, TokenPayload } from '../types/index.js';

const activeRefreshTokens = new Set<string>();
const passwordResetTokens = new Map<string, string>();

export interface RegisterResult {
  user: IUserWithoutPassword;
  tokens: AuthTokens;
}

export class AuthService {
  public static async register(userData: CreateUserInput): Promise<RegisterResult> {
    const existingUser = await User.findByEmail(userData.email);
    if (existingUser) {
      throw { statusCode: 400, message: 'Email address is already registered' };
    }

    const newUser = await User.create(userData);
    const tokens = this.generateTokens(newUser.id, newUser.email, newUser.role);

    return {
      user: User.toJSON(newUser),
      tokens
    };
  }

  public static async login(email: string, password: string): Promise<RegisterResult> {
    const user = await User.findByEmail(email);
    if (!user) {
      throw { statusCode: 401, message: 'Invalid email or password' };
    }

    const isMatch = User.verifyPassword(password, user.password_hash);
    if (!isMatch) {
      throw { statusCode: 401, message: 'Invalid email or password' };
    }

    if (user.status !== 'Active') {
      throw { statusCode: 403, message: 'Account is inactive or suspended' };
    }

    const tokens = this.generateTokens(user.id, user.email, user.role);

    return {
      user: User.toJSON(user),
      tokens
    };
  }

  public static generateTokens(userId: string, email: string, role: string): AuthTokens {
    const payload: TokenPayload = {
      sub: userId,
      email,
      role: role as any
    };

    const accessToken = jwt.sign(payload, env.jwtSecret, {
      expiresIn: JWT_CONFIG.ACCESS_EXPIRATION
    });

    const refreshToken = jwt.sign(payload, env.jwtRefreshSecret, {
      expiresIn: JWT_CONFIG.REFRESH_EXPIRATION
    });

    activeRefreshTokens.add(refreshToken);

    return {
      accessToken,
      refreshToken,
      expiresIn: JWT_CONFIG.ACCESS_EXPIRATION
    };
  }

  public static async refreshToken(token: string): Promise<AuthTokens> {
    if (!token || !activeRefreshTokens.has(token)) {
      throw { statusCode: 401, message: 'Invalid or expired refresh token' };
    }

    try {
      const decoded = jwt.verify(token, env.jwtRefreshSecret) as TokenPayload;
      const user = await User.findById(decoded.sub);

      if (!user) {
        throw { statusCode: 401, message: 'User not found' };
      }

      activeRefreshTokens.delete(token);
      return this.generateTokens(user.id, user.email, user.role);
    } catch {
      activeRefreshTokens.delete(token);
      throw { statusCode: 401, message: 'Refresh token expired or invalid' };
    }
  }

  public static async logout(refreshToken: string): Promise<boolean> {
    if (refreshToken) {
      activeRefreshTokens.delete(refreshToken);
    }
    return true;
  }

  public static async forgotPassword(email: string): Promise<{ message: string; resetToken?: string }> {
    const user = await User.findByEmail(email);
    if (!user) {
      return { message: 'If the email exists, a password reset link has been sent' };
    }

    const resetToken = jwt.sign({ sub: user.id }, env.jwtSecret, {
      expiresIn: JWT_CONFIG.RESET_PASSWORD_EXPIRATION
    });

    passwordResetTokens.set(resetToken, user.id);

    return {
      message: 'Password reset token generated',
      resetToken
    };
  }

  public static async resetPassword(resetToken: string, newPassword: string): Promise<{ message: string }> {
    try {
      const decoded = jwt.verify(resetToken, env.jwtSecret) as TokenPayload;
      const userId = decoded.sub;

      const user = await User.findById(userId);
      if (!user) {
        throw { statusCode: 400, message: 'Invalid user for reset token' };
      }

      await User.updatePassword(userId, newPassword);
      passwordResetTokens.delete(resetToken);

      return { message: 'Password reset successfully' };
    } catch {
      throw { statusCode: 400, message: 'Invalid or expired password reset token' };
    }
  }

  public static async registerDevice(userId: string, fcmToken: string, platform?: string): Promise<IDevice> {
    return await Device.registerDevice({
      user_id: userId,
      fcm_token: fcmToken,
      platform
    });
  }
}
