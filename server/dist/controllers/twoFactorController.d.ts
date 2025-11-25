import { Request, Response } from 'express';
/**
 * Setup 2FA - Generate secret and QR code
 */
export declare const setup2FA: (req: Request, res: Response) => Promise<void>;
/**
 * Enable 2FA after verifying token
 */
export declare const enable2FA: (req: Request, res: Response) => Promise<void>;
/**
 * Disable 2FA
 */
export declare const disable2FA: (req: Request, res: Response) => Promise<void>;
/**
 * Verify 2FA token during login
 */
export declare const verify2FA: (req: Request, res: Response) => Promise<void>;
/**
 * Regenerate backup codes
 */
export declare const regenerateBackupCodes: (req: Request, res: Response) => Promise<void>;
/**
 * Get 2FA status
 */
export declare const get2FAStatus: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=twoFactorController.d.ts.map