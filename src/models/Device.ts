import { randomUUID } from 'crypto';
import { pool } from '../config/db.js';
import { IDevice } from '../types/index.js';
import { logger } from '../utils/logger.js';

const inMemoryDevices: IDevice[] = [];

export interface RegisterDeviceInput {
  user_id: string;
  fcm_token: string;
  platform?: string;
}

export class Device {
  /**
   * Register or Update FCM Device Token in PostgreSQL
   */
  public static async registerDevice(input: RegisterDeviceInput): Promise<IDevice> {
    const platform = input.platform || 'android';
    const deviceId = randomUUID();

    try {
      const queryText = `
        INSERT INTO devices (id, user_id, fcm_token, platform)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;
      const res = await pool.query(queryText, [deviceId, input.user_id, input.fcm_token, platform]);
      return res.rows[0] as IDevice;
    } catch (err: any) {
      logger.warn(`PostgreSQL insert device fallback: ${err.message}`);

      const deviceRecord: IDevice = {
        id: deviceId,
        user_id: input.user_id,
        fcm_token: input.fcm_token,
        platform,
        updated_at: new Date()
      };

      const existingIndex = inMemoryDevices.findIndex(
        (d) => d.user_id === input.user_id && d.fcm_token === input.fcm_token
      );
      if (existingIndex >= 0) {
        inMemoryDevices[existingIndex] = deviceRecord;
      } else {
        inMemoryDevices.push(deviceRecord);
      }
      return deviceRecord;
    }
  }

  /**
   * Get registered devices for user
   */
  public static async getDevicesByUserId(userId: string): Promise<IDevice[]> {
    try {
      const res = await pool.query('SELECT * FROM devices WHERE user_id = $1', [userId]);
      return res.rows as IDevice[];
    } catch {
      return inMemoryDevices.filter((d) => d.user_id === userId);
    }
  }
}
