"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityAuditLog = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const securityAuditLogSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
        type: mongoose_1.Schema.Types.Mixed,
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
}, {
    timestamps: true,
});
// Indexes for efficient queries
securityAuditLogSchema.index({ createdAt: -1 });
securityAuditLogSchema.index({ userId: 1, createdAt: -1 });
securityAuditLogSchema.index({ eventType: 1, createdAt: -1 });
securityAuditLogSchema.index({ severity: 1, createdAt: -1 });
// TTL index - automatically delete logs older than 90 days
securityAuditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });
exports.SecurityAuditLog = mongoose_1.default.model('SecurityAuditLog', securityAuditLogSchema);
//# sourceMappingURL=SecurityAuditLog.js.map