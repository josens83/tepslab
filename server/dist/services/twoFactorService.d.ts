export declare class TwoFactorService {
    /**
     * Generate a new 2FA secret for a user
     */
    static generateSecret(userId: string, email: string): Promise<{
        secret: string;
        qrCodeUrl: string;
        backupCodes: string[];
    }>;
    /**
     * Verify a TOTP token
     */
    static verifyToken(secret: string, token: string): boolean;
    /**
     * Enable 2FA for a user after verifying initial token
     */
    static enableTwoFactor(userId: string, token: string): Promise<boolean>;
    /**
     * Disable 2FA for a user
     */
    static disableTwoFactor(userId: string, token: string): Promise<boolean>;
    /**
     * Verify login with 2FA
     */
    static verifyLogin(userId: string, token: string): Promise<{
        valid: boolean;
        usedBackupCode: boolean;
    }>;
    /**
     * Regenerate backup codes
     */
    static regenerateBackupCodes(userId: string, token: string): Promise<string[]>;
    /**
     * Generate random backup codes
     */
    private static generateBackupCodes;
    /**
     * Hash a backup code for storage
     */
    private static hashBackupCode;
    /**
     * Check if user has 2FA enabled
     */
    static isTwoFactorEnabled(userId: string): Promise<boolean>;
}
//# sourceMappingURL=twoFactorService.d.ts.map