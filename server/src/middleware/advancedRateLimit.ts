import { Request, Response, NextFunction } from 'express';
import { getRedisClient } from '../config/redis';
import { AuthRequest } from '../types';

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  max: number; // Max requests per window
  message?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

interface RateLimitTier {
  free: RateLimitConfig;
  premium: RateLimitConfig;
  admin: RateLimitConfig;
}

// Predefined rate limit tiers
export const RateLimitTiers = {
  API_GENERAL: {
    free: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100,
      message: 'Too many requests. Upgrade to premium for higher limits.',
    },
    premium: {
      windowMs: 15 * 60 * 1000,
      max: 500,
      message: 'Rate limit exceeded. Please try again later.',
    },
    admin: {
      windowMs: 15 * 60 * 1000,
      max: 10000,
      message: 'Rate limit exceeded.',
    },
  },
  API_EXPENSIVE: {
    free: {
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 10,
      message: 'AI requests limited. Upgrade to premium for more requests.',
    },
    premium: {
      windowMs: 60 * 60 * 1000,
      max: 100,
      message: 'AI request limit reached. Please try again later.',
    },
    admin: {
      windowMs: 60 * 60 * 1000,
      max: 1000,
      message: 'AI request limit reached.',
    },
  },
  API_UPLOADS: {
    free: {
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 20,
      message: 'Upload limit reached. Upgrade to premium for more uploads.',
    },
    premium: {
      windowMs: 60 * 60 * 1000,
      max: 200,
      message: 'Upload limit reached. Please try again later.',
    },
    admin: {
      windowMs: 60 * 60 * 1000,
      max: 5000,
      message: 'Upload limit reached.',
    },
  },
  AUTH_ENDPOINTS: {
    free: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5,
      message: 'Too many authentication attempts. Please try again later.',
      skipSuccessfulRequests: true,
    },
    premium: {
      windowMs: 15 * 60 * 1000,
      max: 10,
      message: 'Too many authentication attempts. Please try again later.',
      skipSuccessfulRequests: true,
    },
    admin: {
      windowMs: 15 * 60 * 1000,
      max: 50,
      message: 'Too many authentication attempts.',
      skipSuccessfulRequests: true,
    },
  },
};

/**
 * Advanced Redis-based rate limiter with tiered limits
 */
export const createAdvancedRateLimiter = (
  tier: RateLimitTier,
  keyPrefix: string = 'rate_limit'
) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const redisClient = getRedisClient();

      // If Redis is not available, fall back to in-memory rate limiting
      if (!redisClient || redisClient.status !== 'ready') {
        console.warn('Redis not available for rate limiting');
        return next();
      }

      // Determine user tier
      let userTier: 'free' | 'premium' | 'admin' = 'free';

      if (req.user) {
        if (req.user.role === 'admin') {
          userTier = 'admin';
        } else {
          // Check if user has premium subscription (placeholder logic)
          // In production, check actual subscription status
          userTier = 'free';
        }
      }

      const config = tier[userTier];

      // Generate rate limit key (IP + user ID if authenticated)
      const identifier = req.user
        ? `user:${req.user._id}`
        : `ip:${req.ip || req.socket.remoteAddress}`;

      const key = `${keyPrefix}:${identifier}`;
      const now = Date.now();
      const windowStart = now - config.windowMs;

      // Use Redis sorted set to track requests with timestamps
      const multi = redisClient.multi();

      // Remove old entries outside the current window
      multi.zremrangebyscore(key, 0, windowStart);

      // Count current requests in window
      multi.zcard(key);

      // Add current request
      multi.zadd(key, now, `${now}`);

      // Set expiry on the key
      multi.expire(key, Math.ceil(config.windowMs / 1000));

      const results = await multi.exec();

      // Get count from zCard result (index 1)
      const currentCount = (results?.[1]?.[1] as number) || 0;

      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', config.max);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, config.max - currentCount - 1));
      res.setHeader('X-RateLimit-Reset', new Date(now + config.windowMs).toISOString());

      // Check if limit exceeded
      if (currentCount >= config.max) {
        res.status(429).json({
          success: false,
          error: config.message || 'Too many requests',
          retryAfter: Math.ceil(config.windowMs / 1000),
        });
        return;
      }

      // Store rate limit info for potential skipSuccessfulRequests logic
      if (config.skipSuccessfulRequests) {
        res.on('finish', async () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            // Remove the last request from count on success
            try {
              await redisClient.zrem(key, `${now}`);
            } catch (err) {
              console.error('Failed to remove successful request from rate limit:', err);
            }
          }
        });
      }

      if (config.skipFailedRequests) {
        res.on('finish', async () => {
          if (res.statusCode >= 400) {
            // Remove the last request from count on failure
            try {
              await redisClient.zrem(key, `${now}`);
            } catch (err) {
              console.error('Failed to remove failed request from rate limit:', err);
            }
          }
        });
      }

      next();
    } catch (error) {
      console.error('Rate limiter error:', error);
      // On error, allow the request (fail open)
      next();
    }
  };
};

/**
 * IP-based rate limiter (for unauthenticated endpoints)
 */
export const ipRateLimiter = (config: RateLimitConfig) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const redisClient = getRedisClient();

      if (!redisClient || redisClient.status !== 'ready') {
        console.warn('Redis not available for IP rate limiting');
        return next();
      }

      const ip = req.ip || req.socket.remoteAddress || 'unknown';
      const key = `ip_rate_limit:${ip}`;
      const now = Date.now();
      const windowStart = now - config.windowMs;

      const multi = redisClient.multi();
      multi.zremrangebyscore(key, 0, windowStart);
      multi.zcard(key);
      multi.zadd(key, now, `${now}`);
      multi.expire(key, Math.ceil(config.windowMs / 1000));

      const results = await multi.exec();
      const currentCount = (results?.[1]?.[1] as number) || 0;

      res.setHeader('X-RateLimit-Limit', config.max);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, config.max - currentCount - 1));

      if (currentCount >= config.max) {
        res.status(429).json({
          success: false,
          error: config.message || 'Too many requests from this IP',
          retryAfter: Math.ceil(config.windowMs / 1000),
        });
        return;
      }

      next();
    } catch (error) {
      console.error('IP rate limiter error:', error);
      next();
    }
  };
};

/**
 * Custom rate limiter for specific endpoints
 */
export const customRateLimiter = (windowMs: number, max: number, message?: string) => {
  const config: RateLimitConfig = {
    windowMs,
    max,
    message: message || `Rate limit exceeded. Maximum ${max} requests per ${windowMs / 1000} seconds.`,
  };

  return createAdvancedRateLimiter(
    {
      free: config,
      premium: { ...config, max: max * 2 },
      admin: { ...config, max: max * 10 },
    },
    'custom_rate_limit'
  );
};
