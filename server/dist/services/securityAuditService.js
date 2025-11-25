"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityAuditService = void 0;
const SecurityAuditLog_1 = require("../models/SecurityAuditLog");
const mongoose_1 = __importDefault(require("mongoose"));
class SecurityAuditService {
    /**
     * Log a security event
     */
    static async logEvent(params) {
        try {
            const { userId, eventType, eventDescription, request, metadata = {}, severity = 'low', success = true, } = params;
            // Extract IP address
            const ipAddress = request.ip ||
                request.headers['x-forwarded-for'] ||
                request.socket.remoteAddress ||
                'unknown';
            // Extract user agent
            const userAgent = request.headers['user-agent'] || 'unknown';
            // Create audit log entry
            await SecurityAuditLog_1.SecurityAuditLog.create({
                userId: userId ? new mongoose_1.default.Types.ObjectId(userId.toString()) : undefined,
                eventType,
                eventDescription,
                ipAddress: Array.isArray(ipAddress) ? ipAddress[0] : ipAddress,
                userAgent,
                metadata,
                severity,
                success,
            });
            // Log critical events to console for immediate attention
            if (severity === 'critical') {
                console.error('🚨 CRITICAL SECURITY EVENT:', {
                    eventType,
                    eventDescription,
                    userId,
                    ipAddress,
                });
            }
        }
        catch (error) {
            // Never throw - logging should not break the application
            console.error('Failed to log security event:', error);
        }
    }
    /**
     * Log successful login
     */
    static async logLoginSuccess(userId, request, metadata) {
        await this.logEvent({
            userId,
            eventType: 'login_success',
            eventDescription: 'User logged in successfully',
            request,
            metadata,
            severity: 'low',
            success: true,
        });
    }
    /**
     * Log failed login attempt
     */
    static async logLoginFailure(email, request, reason) {
        await this.logEvent({
            eventType: 'login_failure',
            eventDescription: `Failed login attempt for ${email}: ${reason}`,
            request,
            metadata: { email, reason },
            severity: 'medium',
            success: false,
        });
        // Check for brute force attempts
        await this.checkBruteForce(request);
    }
    /**
     * Log logout
     */
    static async logLogout(userId, request) {
        await this.logEvent({
            userId,
            eventType: 'logout',
            eventDescription: 'User logged out',
            request,
            severity: 'low',
            success: true,
        });
    }
    /**
     * Log user registration
     */
    static async logRegistration(userId, request, metadata) {
        await this.logEvent({
            userId,
            eventType: 'register',
            eventDescription: 'New user registered',
            request,
            metadata,
            severity: 'low',
            success: true,
        });
    }
    /**
     * Log password change
     */
    static async logPasswordChange(userId, request) {
        await this.logEvent({
            userId,
            eventType: 'password_change',
            eventDescription: 'User changed password',
            request,
            severity: 'medium',
            success: true,
        });
    }
    /**
     * Log 2FA enabled
     */
    static async log2FAEnabled(userId, request) {
        await this.logEvent({
            userId,
            eventType: '2fa_enabled',
            eventDescription: 'Two-factor authentication enabled',
            request,
            severity: 'medium',
            success: true,
        });
    }
    /**
     * Log 2FA disabled
     */
    static async log2FADisabled(userId, request) {
        await this.logEvent({
            userId,
            eventType: '2fa_disabled',
            eventDescription: 'Two-factor authentication disabled',
            request,
            severity: 'high',
            success: true,
        });
    }
    /**
     * Log 2FA verification success
     */
    static async log2FAVerifySuccess(userId, request) {
        await this.logEvent({
            userId,
            eventType: '2fa_verify_success',
            eventDescription: '2FA verification successful',
            request,
            severity: 'low',
            success: true,
        });
    }
    /**
     * Log 2FA verification failure
     */
    static async log2FAVerifyFailure(userId, request) {
        await this.logEvent({
            userId,
            eventType: '2fa_verify_failure',
            eventDescription: '2FA verification failed',
            request,
            severity: 'medium',
            success: false,
        });
    }
    /**
     * Log backup code usage
     */
    static async log2FABackupCodeUsed(userId, request) {
        await this.logEvent({
            userId,
            eventType: '2fa_backup_code_used',
            eventDescription: 'Backup code used for 2FA',
            request,
            severity: 'high',
            success: true,
        });
    }
    /**
     * Log OAuth login
     */
    static async logOAuthLogin(userId, provider, request) {
        await this.logEvent({
            userId,
            eventType: 'oauth_login',
            eventDescription: `User logged in via ${provider}`,
            request,
            metadata: { provider },
            severity: 'low',
            success: true,
        });
    }
    /**
     * Log permission denied
     */
    static async logPermissionDenied(userId, resource, request) {
        await this.logEvent({
            userId,
            eventType: 'permission_denied',
            eventDescription: `Access denied to ${resource}`,
            request,
            metadata: { resource },
            severity: 'medium',
            success: false,
        });
    }
    /**
     * Log suspicious activity
     */
    static async logSuspiciousActivity(description, request, metadata) {
        await this.logEvent({
            eventType: 'suspicious_activity',
            eventDescription: description,
            request,
            metadata,
            severity: 'high',
            success: false,
        });
    }
    /**
     * Log rate limit exceeded
     */
    static async logRateLimitExceeded(endpoint, request) {
        await this.logEvent({
            eventType: 'rate_limit_exceeded',
            eventDescription: `Rate limit exceeded for ${endpoint}`,
            request,
            metadata: { endpoint },
            severity: 'medium',
            success: false,
        });
    }
    /**
     * Check for brute force attempts
     */
    static async checkBruteForce(request) {
        try {
            const ipAddress = request.ip ||
                request.headers['x-forwarded-for'] ||
                request.socket.remoteAddress;
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
            // Count failed login attempts from this IP in last 5 minutes
            const failedAttempts = await SecurityAuditLog_1.SecurityAuditLog.countDocuments({
                eventType: 'login_failure',
                ipAddress: Array.isArray(ipAddress) ? ipAddress[0] : ipAddress,
                createdAt: { $gte: fiveMinutesAgo },
            });
            // If more than 5 failed attempts, log as suspicious
            if (failedAttempts >= 5) {
                await this.logSuspiciousActivity(`Possible brute force attack: ${failedAttempts} failed login attempts in 5 minutes`, request, { failedAttempts, timeWindow: '5 minutes' });
            }
        }
        catch (error) {
            console.error('Failed to check brute force:', error);
        }
    }
    /**
     * Get security audit logs for a user
     */
    static async getUserAuditLogs(userId, limit = 50) {
        try {
            return await SecurityAuditLog_1.SecurityAuditLog.find({
                userId: new mongoose_1.default.Types.ObjectId(userId),
            })
                .sort({ createdAt: -1 })
                .limit(limit)
                .lean();
        }
        catch (error) {
            console.error('Failed to get user audit logs:', error);
            return [];
        }
    }
    /**
     * Get recent security events
     */
    static async getRecentEvents(filters = {}, limit = 100) {
        try {
            return await SecurityAuditLog_1.SecurityAuditLog.find(filters)
                .sort({ createdAt: -1 })
                .limit(limit)
                .populate('userId', 'email name')
                .lean();
        }
        catch (error) {
            console.error('Failed to get recent events:', error);
            return [];
        }
    }
}
exports.SecurityAuditService = SecurityAuditService;
//# sourceMappingURL=securityAuditService.js.map