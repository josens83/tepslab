import { Request, Response } from 'express';
import { TwoFactorService } from '../services/twoFactorService';

/**
 * Setup 2FA - Generate secret and QR code
 */
export const setup2FA = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const userEmail = req.user?.email;

    if (!userId || !userEmail) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    const { secret, qrCodeUrl, backupCodes } = await TwoFactorService.generateSecret(
      userId,
      userEmail
    );

    res.status(200).json({
      success: true,
      data: {
        secret,
        qrCodeUrl,
        backupCodes,
        message: 'Scan the QR code with your authenticator app and save the backup codes in a secure location.',
      },
    });
  } catch (error: any) {
    console.error('Setup 2FA error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to setup 2FA',
    });
  }
};

/**
 * Enable 2FA after verifying token
 */
export const enable2FA = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { token } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    if (!token) {
      res.status(400).json({
        success: false,
        message: 'Verification token is required',
      });
      return;
    }

    await TwoFactorService.enableTwoFactor(userId, token);

    res.status(200).json({
      success: true,
      message: '2FA has been enabled successfully',
    });
  } catch (error: any) {
    console.error('Enable 2FA error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to enable 2FA',
    });
  }
};

/**
 * Disable 2FA
 */
export const disable2FA = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { token } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    if (!token) {
      res.status(400).json({
        success: false,
        message: 'Verification token is required',
      });
      return;
    }

    await TwoFactorService.disableTwoFactor(userId, token);

    res.status(200).json({
      success: true,
      message: '2FA has been disabled successfully',
    });
  } catch (error: any) {
    console.error('Disable 2FA error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to disable 2FA',
    });
  }
};

/**
 * Verify 2FA token during login
 */
export const verify2FA = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, token } = req.body;

    if (!userId || !token) {
      res.status(400).json({
        success: false,
        message: 'User ID and token are required',
      });
      return;
    }

    const result = await TwoFactorService.verifyLogin(userId, token);

    if (!result.valid) {
      res.status(401).json({
        success: false,
        message: 'Invalid verification code',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        verified: true,
        usedBackupCode: result.usedBackupCode,
        ...(result.usedBackupCode && {
          warning: 'You used a backup code. Please regenerate your backup codes.',
        }),
      },
    });
  } catch (error: any) {
    console.error('Verify 2FA error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to verify 2FA token',
    });
  }
};

/**
 * Regenerate backup codes
 */
export const regenerateBackupCodes = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { token } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    if (!token) {
      res.status(400).json({
        success: false,
        message: 'Verification token is required',
      });
      return;
    }

    const backupCodes = await TwoFactorService.regenerateBackupCodes(userId, token);

    res.status(200).json({
      success: true,
      data: {
        backupCodes,
        message: 'New backup codes generated. Save them in a secure location.',
      },
    });
  } catch (error: any) {
    console.error('Regenerate backup codes error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to regenerate backup codes',
    });
  }
};

/**
 * Get 2FA status
 */
export const get2FAStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    const isEnabled = await TwoFactorService.isTwoFactorEnabled(userId);

    res.status(200).json({
      success: true,
      data: {
        twoFactorEnabled: isEnabled,
      },
    });
  } catch (error: any) {
    console.error('Get 2FA status error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get 2FA status',
    });
  }
};
