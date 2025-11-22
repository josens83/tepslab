import mongoose, { Schema, Document } from 'mongoose';

export type SecurityEventType =
  | 'login_success'
  | 'login_failure'
  | 'logout'
  | 'register'
  | 'password_change'
  | 'password_reset_request'
  | 'password_reset_success'
  | 'email_change'
  | 'profile_update'
  | '2fa_enabled'
  | '2fa_disabled'
  | '2fa_verify_success'
  | '2fa_verify_failure'
  | '2fa_backup_code_used'
  | 'oauth_login'
  | 'account_locked'
  | 'account_unlocked'
  | 'account_deleted'
  | 'permission_denied'
  | 'suspicious_activity'
  | 'rate_limit_exceeded'
  | 'api_key_created'
  | 'api_key_revoked';

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

const securityAuditLogSchema = new Schema<ISecurityAuditLogDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    eventType: {
      type: String,
      required: true,
      enum: [
        'login_success',
        'login_failure',
        'logout',
        'register',
        'password_change',
        'password_reset_request',
        'password_reset_success',
        'email_change',
        'profile_update',
        '2fa_enabled',
        '2fa_disabled',
        '2fa_verify_success',
        '2fa_verify_failure',
        '2fa_backup_code_used',
        'oauth_login',
        'account_locked',
        'account_unlocked',
        'account_deleted',
        'permission_denied',
        'suspicious_activity',
        'rate_limit_exceeded',
        'api_key_created',
        'api_key_revoked',
      ],
      index: true,
    },
    eventDescription: {
      type: String,
      required: true,
    },
    ipAddress: {
      type: String,
      required: true,
      index: true,
    },
    userAgent: {
      type: String,
      required: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'low',
      index: true,
    },
    success: {
      type: Boolean,
      required: true,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
securityAuditLogSchema.index({ createdAt: -1 });
securityAuditLogSchema.index({ userId: 1, createdAt: -1 });
securityAuditLogSchema.index({ eventType: 1, createdAt: -1 });
securityAuditLogSchema.index({ severity: 1, createdAt: -1 });

// TTL index - automatically delete logs older than 90 days
securityAuditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

export const SecurityAuditLog = mongoose.model<ISecurityAuditLogDocument>(
  'SecurityAuditLog',
  securityAuditLogSchema
);
