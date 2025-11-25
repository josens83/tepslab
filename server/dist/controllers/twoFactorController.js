"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.get2FAStatus = exports.regenerateBackupCodes = exports.verify2FA = exports.disable2FA = exports.enable2FA = exports.setup2FA = void 0;
const twoFactorService_1 = require("../services/twoFactorService");
/**
 * Setup 2FA - Generate secret and QR code
 */
const setup2FA = async (req, res) => {
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
        const { secret, qrCodeUrl, backupCodes } = await twoFactorService_1.TwoFactorService.generateSecret(userId, userEmail);
        res.status(200).json({
            success: true,
            data: {
                secret,
                qrCodeUrl,
                backupCodes,
                message: 'Scan the QR code with your authenticator app and save the backup codes in a secure location.',
            },
        });
    }
    catch (error) {
        console.error('Setup 2FA error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to setup 2FA',
        });
    }
};
exports.setup2FA = setup2FA;
/**
 * Enable 2FA after verifying token
 */
const enable2FA = async (req, res) => {
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
        await twoFactorService_1.TwoFactorService.enableTwoFactor(userId, token);
        res.status(200).json({
            success: true,
            message: '2FA has been enabled successfully',
        });
    }
    catch (error) {
        console.error('Enable 2FA error:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to enable 2FA',
        });
    }
};
exports.enable2FA = enable2FA;
/**
 * Disable 2FA
 */
const disable2FA = async (req, res) => {
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
        await twoFactorService_1.TwoFactorService.disableTwoFactor(userId, token);
        res.status(200).json({
            success: true,
            message: '2FA has been disabled successfully',
        });
    }
    catch (error) {
        console.error('Disable 2FA error:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to disable 2FA',
        });
    }
};
exports.disable2FA = disable2FA;
/**
 * Verify 2FA token during login
 */
const verify2FA = async (req, res) => {
    try {
        const { userId, token } = req.body;
        if (!userId || !token) {
            res.status(400).json({
                success: false,
                message: 'User ID and token are required',
            });
            return;
        }
        const result = await twoFactorService_1.TwoFactorService.verifyLogin(userId, token);
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
    }
    catch (error) {
        console.error('Verify 2FA error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to verify 2FA token',
        });
    }
};
exports.verify2FA = verify2FA;
/**
 * Regenerate backup codes
 */
const regenerateBackupCodes = async (req, res) => {
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
        const backupCodes = await twoFactorService_1.TwoFactorService.regenerateBackupCodes(userId, token);
        res.status(200).json({
            success: true,
            data: {
                backupCodes,
                message: 'New backup codes generated. Save them in a secure location.',
            },
        });
    }
    catch (error) {
        console.error('Regenerate backup codes error:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to regenerate backup codes',
        });
    }
};
exports.regenerateBackupCodes = regenerateBackupCodes;
/**
 * Get 2FA status
 */
const get2FAStatus = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Unauthorized',
            });
            return;
        }
        const isEnabled = await twoFactorService_1.TwoFactorService.isTwoFactorEnabled(userId);
        res.status(200).json({
            success: true,
            data: {
                twoFactorEnabled: isEnabled,
            },
        });
    }
    catch (error) {
        console.error('Get 2FA status error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get 2FA status',
        });
    }
};
exports.get2FAStatus = get2FAStatus;
//# sourceMappingURL=twoFactorController.js.map