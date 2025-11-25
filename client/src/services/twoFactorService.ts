import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface TwoFactorSetupResponse {
  success: boolean;
  data: {
    secret: string;
    qrCodeUrl: string;
    backupCodes: string[];
    message: string;
  };
}

export interface TwoFactorStatusResponse {
  success: boolean;
  data: {
    twoFactorEnabled: boolean;
  };
}

export class TwoFactorService {
  /**
   * Get 2FA status for current user
   */
  static async getStatus(): Promise<boolean> {
    try {
      const response = await axios.get<TwoFactorStatusResponse>(`${API_URL}/auth/2fa/status`);
      return response.data.data.twoFactorEnabled;
    } catch (error) {
      console.error('Failed to get 2FA status:', error);
      return false;
    }
  }

  /**
   * Setup 2FA - Generate secret and QR code
   */
  static async setup(): Promise<TwoFactorSetupResponse['data']> {
    const response = await axios.post<TwoFactorSetupResponse>(`${API_URL}/auth/2fa/setup`);
    return response.data.data;
  }

  /**
   * Enable 2FA after scanning QR code
   */
  static async enable(token: string): Promise<void> {
    await axios.post(`${API_URL}/auth/2fa/enable`, { token });
  }

  /**
   * Disable 2FA
   */
  static async disable(token: string): Promise<void> {
    await axios.post(`${API_URL}/auth/2fa/disable`, { token });
  }

  /**
   * Verify 2FA token during login
   */
  static async verify(userId: string, token: string): Promise<void> {
    await axios.post(`${API_URL}/auth/2fa/verify`, { userId, token });
  }

  /**
   * Regenerate backup codes
   */
  static async regenerateBackupCodes(token: string): Promise<string[]> {
    const response = await axios.post<{
      success: boolean;
      data: { backupCodes: string[] };
    }>(`${API_URL}/auth/2fa/backup-codes/regenerate`, { token });
    return response.data.data.backupCodes;
  }
}
