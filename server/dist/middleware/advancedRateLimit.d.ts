import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
interface RateLimitConfig {
    windowMs: number;
    max: number;
    message?: string;
    skipSuccessfulRequests?: boolean;
    skipFailedRequests?: boolean;
}
interface RateLimitTier {
    free: RateLimitConfig;
    premium: RateLimitConfig;
    admin: RateLimitConfig;
}
export declare const RateLimitTiers: {
    API_GENERAL: {
        free: {
            windowMs: number;
            max: number;
            message: string;
        };
        premium: {
            windowMs: number;
            max: number;
            message: string;
        };
        admin: {
            windowMs: number;
            max: number;
            message: string;
        };
    };
    API_EXPENSIVE: {
        free: {
            windowMs: number;
            max: number;
            message: string;
        };
        premium: {
            windowMs: number;
            max: number;
            message: string;
        };
        admin: {
            windowMs: number;
            max: number;
            message: string;
        };
    };
    API_UPLOADS: {
        free: {
            windowMs: number;
            max: number;
            message: string;
        };
        premium: {
            windowMs: number;
            max: number;
            message: string;
        };
        admin: {
            windowMs: number;
            max: number;
            message: string;
        };
    };
    AUTH_ENDPOINTS: {
        free: {
            windowMs: number;
            max: number;
            message: string;
            skipSuccessfulRequests: boolean;
        };
        premium: {
            windowMs: number;
            max: number;
            message: string;
            skipSuccessfulRequests: boolean;
        };
        admin: {
            windowMs: number;
            max: number;
            message: string;
            skipSuccessfulRequests: boolean;
        };
    };
};
/**
 * Advanced Redis-based rate limiter with tiered limits
 */
export declare const createAdvancedRateLimiter: (tier: RateLimitTier, keyPrefix?: string) => (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
/**
 * IP-based rate limiter (for unauthenticated endpoints)
 */
export declare const ipRateLimiter: (config: RateLimitConfig) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Custom rate limiter for specific endpoints
 */
export declare const customRateLimiter: (windowMs: number, max: number, message?: string) => (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export {};
//# sourceMappingURL=advancedRateLimit.d.ts.map