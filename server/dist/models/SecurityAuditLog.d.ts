import mongoose, { Document } from 'mongoose';
export type SecurityEventType = 'login_success' | 'login_failure' | 'logout' | 'register' | 'password_change' | 'password_reset_request' | 'password_reset_success' | 'email_change' | 'profile_update' | '2fa_enabled' | '2fa_disabled' | '2fa_verify_success' | '2fa_verify_failure' | '2fa_backup_code_used' | 'oauth_login' | 'account_locked' | 'account_unlocked' | 'account_deleted' | 'permission_denied' | 'suspicious_activity' | 'rate_limit_exceeded' | 'api_key_created' | 'api_key_revoked';
export interface ISecurityAuditLogDocument extends Document {
    userId?: mongoose.Types.ObjectId;
    eventType: SecurityEventType;
    eventDescription: string;
    ipAddress: string;
    userAgent: string;
    metadata?: Record<string, any>;
    severity: 'low' | 'medium' | 'high' | 'critical';
    success: boolean;
    createdAt: Date;
}
export declare const SecurityAuditLog: mongoose.Model<ISecurityAuditLogDocument, {}, {}, {}, mongoose.Document<unknown, {}, ISecurityAuditLogDocument, {}, {}> & ISecurityAuditLogDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=SecurityAuditLog.d.ts.map