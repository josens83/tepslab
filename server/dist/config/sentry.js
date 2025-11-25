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
exports.addBreadcrumb = exports.captureException = exports.clearSentryUser = exports.setSentryUser = exports.initSentry = void 0;
const Sentry = __importStar(require("@sentry/node"));
const profiling_node_1 = require("@sentry/profiling-node");
const initSentry = () => {
    const SENTRY_DSN = process.env.SENTRY_DSN;
    if (!SENTRY_DSN) {
        console.warn('Sentry DSN not configured');
        return;
    }
    Sentry.init({
        dsn: SENTRY_DSN,
        environment: process.env.NODE_ENV || 'development',
        integrations: [
            (0, profiling_node_1.nodeProfilingIntegration)(),
        ],
        // Performance Monitoring
        tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
        // Profiling
        profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
        // Release tracking
        release: process.env.APP_VERSION || '1.0.0',
        beforeSend(event, _hint) {
            // Filter out certain errors in development
            if (process.env.NODE_ENV === 'development') {
                console.log('Sentry Event:', event);
            }
            return event;
        },
    });
    console.log('✅ Sentry initialized');
};
exports.initSentry = initSentry;
// Set user context
const setSentryUser = (user) => {
    Sentry.setUser({
        id: user.id,
        email: user.email,
        username: user.name,
        role: user.role,
    });
};
exports.setSentryUser = setSentryUser;
// Clear user context
const clearSentryUser = () => {
    Sentry.setUser(null);
};
exports.clearSentryUser = clearSentryUser;
// Capture exception manually
const captureException = (error, context) => {
    Sentry.captureException(error, {
        extra: context,
    });
};
exports.captureException = captureException;
// Add breadcrumb
const addBreadcrumb = (message, category, data) => {
    Sentry.addBreadcrumb({
        message,
        category: category || 'general',
        data,
        level: 'info',
    });
};
exports.addBreadcrumb = addBreadcrumb;
exports.default = Sentry;
//# sourceMappingURL=sentry.js.map