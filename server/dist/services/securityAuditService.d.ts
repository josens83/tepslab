import { Request } from 'express';
import { SecurityEventType } from '../models/SecurityAuditLog';
import mongoose from 'mongoose';
interface LogSecurityEventParams {
    userId?: string | mongoose.Types.ObjectId;
    eventType: SecurityEventType;
    eventDescription: string;
    request: Request;
    metadata?: Record<string, any>;
    severity?: 'low' | 'medium' | 'high' | 'critical';
    success?: boolean;
}
export declare class SecurityAuditService {
    /**
     * Log a security event
     */
    static logEvent(params: LogSecurityEventParams): Promise<void>;
    /**
     * Log successful login
     */
    static logLoginSuccess(userId: string, request: Request, metadata?: Record<string, any>): Promise<void>;
    /**
     * Log failed login attempt
     */
    static logLoginFailure(email: string, request: Request, reason: string): Promise<void>;
    /**
     * Log logout
     */
    static logLogout(userId: string, request: Request): Promise<void>;
    /**
     * Log user registration
     */
    static logRegistration(userId: string, request: Request, metadata?: Record<string, any>): Promise<void>;
    /**
     * Log password change
     */
    static logPasswordChange(userId: string, request: Request): Promise<void>;
    /**
     * Log 2FA enabled
     */
    static log2FAEnabled(userId: string, request: Request): Promise<void>;
    /**
     * Log 2FA disabled
     */
    static log2FADisabled(userId: string, request: Request): Promise<void>;
    /**
     * Log 2FA verification success
     */
    static log2FAVerifySuccess(userId: string, request: Request): Promise<void>;
    /**
     * Log 2FA verification failure
     */
    static log2FAVerifyFailure(userId: string, request: Request): Promise<void>;
    /**
     * Log backup code usage
     */
    static log2FABackupCodeUsed(userId: string, request: Request): Promise<void>;
    /**
     * Log OAuth login
     */
    static logOAuthLogin(userId: string, provider: string, request: Request): Promise<void>;
    /**
     * Log permission denied
     */
    static logPermissionDenied(userId: string | undefined, resource: string, request: Request): Promise<void>;
    /**
     * Log suspicious activity
     */
    static logSuspiciousActivity(description: string, request: Request, metadata?: Record<string, any>): Promise<void>;
    /**
     * Log rate limit exceeded
     */
    static logRateLimitExceeded(endpoint: string, request: Request): Promise<void>;
    /**
     * Check for brute force attempts
     */
    private static checkBruteForce;
    /**
     * Get security audit logs for a user
     */
    static getUserAuditLogs(userId: string, limit?: number): Promise<any[]>;
    /**
     * Get recent security events
     */
    static getRecentEvents(filters?: {
        severity?: string;
        eventType?: SecurityEventType;
        success?: boolean;
    }, limit?: number): Promise<any[]>;
}
export {};
//# sourceMappingURL=securityAuditService.d.ts.map