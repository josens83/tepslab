"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TwoFactorService = void 0;
const speakeasy_1 = __importDefault(require("speakeasy"));
const qrcode_1 = __importDefault(require("qrcode"));
const crypto_1 = __importDefault(require("crypto"));
const User_1 = require("../models/User");
class TwoFactorService {
    /**
     * Generate a new 2FA secret for a user
     */
    static async generateSecret(userId, email) {
        // Generate secret
        const secret = speakeasy_1.default.generateSecret({
            name: `TEPS Lab (${email})`,
            issuer: 'TEPS Lab',
            length: 32,
        });
        // Generate backup codes (10 codes)
        const backupCodes = this.generateBackupCodes(10);
        // Hash backup codes before storing
        const hashedBackupCodes = await Promise.all(backupCodes.map(code => this.hashBackupCode(code)));
        // Store secret and backup codes in database
        await User_1.User.findByIdAndUpdate(userId, {
            twoFactorSecret: secret.base32,
            twoFactorBackupCodes: hashedBackupCodes,
        });
        // Generate QR code
        const qrCodeUrl = await qrcode_1.default.toDataURL(secret.otpauth_url || '');
        return {
            secret: secret.base32 || '',
            qrCodeUrl,
            backupCodes, // Return unhashed codes to user (only time they'll see them)
        };
    }
    /**
     * Verify a TOTP token
     */
    static verifyToken(secret, token) {
        return speakeasy_1.default.totp.verify({
            secret,
            encoding: 'base32',
            token,
            window: 2, // Allow 2 time steps before/after for clock drift
        });
    }
    /**
     * Enable 2FA for a user after verifying initial token
     */
    static async enableTwoFactor(userId, token) {
        const user = await User_1.User.findById(userId).select('+twoFactorSecret');
        if (!user || !user.twoFactorSecret) {
            throw new Error('2FA secret not found');
        }
        // Verify the token
        const isValid = this.verifyToken(user.twoFactorSecret, token);
        if (!isValid) {
            throw new Error('Invalid verification code');
        }
        // Enable 2FA
        await User_1.User.findByIdAndUpdate(userId, {
            twoFactorEnabled: true,
        });
        return true;
    }
    /**
     * Disable 2FA for a user
     */
    static async disableTwoFactor(userId, token) {
        const user = await User_1.User.findById(userId).select('+twoFactorSecret');
        if (!user || !user.twoFactorSecret) {
            throw new Error('2FA not enabled');
        }
        // Verify the token before disabling
        const isValid = this.verifyToken(user.twoFactorSecret, token);
        if (!isValid) {
            throw new Error('Invalid verification code');
        }
        // Disable 2FA and remove secrets
        await User_1.User.findByIdAndUpdate(userId, {
            twoFactorEnabled: false,
            twoFactorSecret: undefined,
            twoFactorBackupCodes: undefined,
        });
        return true;
    }
    /**
     * Verify login with 2FA
     */
    static async verifyLogin(userId, token) {
        const user = await User_1.User.findById(userId).select('+twoFactorSecret +twoFactorBackupCodes');
        if (!user || !user.twoFactorEnabled) {
            throw new Error('2FA not enabled for this user');
        }
        // Try TOTP token first
        if (user.twoFactorSecret && this.verifyToken(user.twoFactorSecret, token)) {
            return { valid: true, usedBackupCode: false };
        }
        // If TOTP failed, try backup codes
        if (user.twoFactorBackupCodes && user.twoFactorBackupCodes.length > 0) {
            const hashedToken = await this.hashBackupCode(token);
            const backupCodeIndex = user.twoFactorBackupCodes.indexOf(hashedToken);
            if (backupCodeIndex !== -1) {
                // Remove used backup code
                user.twoFactorBackupCodes.splice(backupCodeIndex, 1);
                await user.save();
                return { valid: true, usedBackupCode: true };
            }
        }
        return { valid: false, usedBackupCode: false };
    }
    /**
     * Regenerate backup codes
     */
    static async regenerateBackupCodes(userId, token) {
        const user = await User_1.User.findById(userId).select('+twoFactorSecret');
        if (!user || !user.twoFactorSecret) {
            throw new Error('2FA not enabled');
        }
        // Verify the token before regenerating
        const isValid = this.verifyToken(user.twoFactorSecret, token);
        if (!isValid) {
            throw new Error('Invalid verification code');
        }
        // Generate new backup codes
        const backupCodes = this.generateBackupCodes(10);
        const hashedBackupCodes = await Promise.all(backupCodes.map(code => this.hashBackupCode(code)));
        // Update backup codes
        await User_1.User.findByIdAndUpdate(userId, {
            twoFactorBackupCodes: hashedBackupCodes,
        });
        return backupCodes;
    }
    /**
     * Generate random backup codes
     */
    static generateBackupCodes(count) {
        const codes = [];
        for (let i = 0; i < count; i++) {
            // Generate 8-character alphanumeric code
            const code = crypto_1.default.randomBytes(4).toString('hex').toUpperCase();
            codes.push(code);
        }
        return codes;
    }
    /**
     * Hash a backup code for storage
     */
    static async hashBackupCode(code) {
        return new Promise((resolve, reject) => {
            crypto_1.default.pbkdf2(code, 'tepslab-2fa-backup', 100000, 64, 'sha512', (err, derivedKey) => {
                if (err)
                    reject(err);
                else
                    resolve(derivedKey.toString('hex'));
            });
        });
    }
    /**
     * Check if user has 2FA enabled
     */
    static async isTwoFactorEnabled(userId) {
        const user = await User_1.User.findById(userId);
        return user?.twoFactorEnabled || false;
    }
}
exports.TwoFactorService = TwoFactorService;
//# sourceMappingURL=twoFactorService.js.map