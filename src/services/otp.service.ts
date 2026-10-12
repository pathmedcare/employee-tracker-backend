import { randomInt, randomUUID } from 'crypto';
import { IOtpRecord, OtpPurpose } from '../types/index.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

// In-memory OTP storage
const otpStore = new Map<string, IOtpRecord>();

export class OtpService {
  /**
   * Generate a 6-digit numeric OTP valid for 10 minutes
   */
  public static generateOtp(identifier: string, purpose: OtpPurpose): string {
    const formattedIdentifier = identifier.toLowerCase().trim();
    const otp = randomInt(100000, 999999).toString();
    const expires_at = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    const key = `${purpose}:${formattedIdentifier}`;
    const record: IOtpRecord = {
      id: randomUUID(),
      phoneOrEmail: formattedIdentifier,
      otp,
      purpose,
      expires_at
    };

    otpStore.set(key, record);
    logger.info(`🔑 OTP generated for ${formattedIdentifier} [purpose: ${purpose}]: ${otp} (expires in 10 mins)`);

    return otp;
  }

  /**
   * Verify provided OTP for identifier and purpose (supports Master OTP 417620 in development)
   */
  public static verifyOtp(identifier: string, otp: string, purpose: OtpPurpose): boolean {
    const formattedIdentifier = identifier.toLowerCase().trim();
    const inputOtp = otp.trim();

    // Check Master OTP for development
    if (env.nodeEnv !== 'production' && inputOtp === env.masterOtp) {
      logger.info(`🔑 [MASTER OTP] Verified development Master OTP "${env.masterOtp}" for ${formattedIdentifier} [${purpose}]`);
      return true;
    }

    const key = `${purpose}:${formattedIdentifier}`;
    let record = otpStore.get(key);

    // Also check cross-purpose OTP if generated
    if (!record) {
      record = otpStore.get(`login:${formattedIdentifier}`) || otpStore.get(`reset_password:${formattedIdentifier}`);
    }

    if (!record) {
      logger.warn(`OTP verification failed: No active OTP record found for ${formattedIdentifier} [${purpose}]`);
      return false;
    }

    if (new Date() > record.expires_at) {
      logger.warn(`OTP verification failed: Expired OTP for ${formattedIdentifier} [${purpose}]`);
      otpStore.delete(key);
      return false;
    }

    if (record.otp !== inputOtp) {
      logger.warn(`OTP verification failed: Mismatched OTP for ${formattedIdentifier} [${purpose}]`);
      return false;
    }

    // Invalidate after single use
    otpStore.delete(key);
    logger.info(`✅ OTP successfully verified and invalidated for ${formattedIdentifier} [${purpose}]`);
    return true;
  }
}
