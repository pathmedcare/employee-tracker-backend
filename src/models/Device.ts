import { IDevice } from '../types/index.js';

const devices: IDevice[] = [];

export interface RegisterDeviceInput {
  user_id: string;
  fcm_token: string;
  platform?: string;
}

export class Device {
  public static async registerDevice(input: RegisterDeviceInput): Promise<IDevice> {
    const existingIndex = devices.findIndex(
      (d) => d.user_id === input.user_id && d.fcm_token === input.fcm_token
    );

    const deviceRecord: IDevice = {
      id: `dev_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      user_id: input.user_id,
      fcm_token: input.fcm_token,
      platform: input.platform || 'android',
      updated_at: new Date()
    };

    if (existingIndex >= 0) {
      devices[existingIndex] = deviceRecord;
    } else {
      devices.push(deviceRecord);
    }
    return deviceRecord;
  }

  public static async getDevicesByUserId(userId: string): Promise<IDevice[]> {
    return devices.filter((d) => d.user_id === userId);
  }
}
