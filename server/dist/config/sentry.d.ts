import * as Sentry from '@sentry/node';
export declare const initSentry: () => void;
export declare const setSentryUser: (user: {
    id: string;
    email: string;
    name: string;
    role: string;
}) => void;
export declare const clearSentryUser: () => void;
export declare const captureException: (error: Error, context?: Record<string, any>) => void;
export declare const addBreadcrumb: (message: string, category?: string, data?: Record<string, any>) => void;
export default Sentry;
//# sourceMappingURL=sentry.d.ts.map