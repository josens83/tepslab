import { Request, Response, NextFunction } from 'express';
import { getRedisClient } from '../config/redis';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds (default: 5 minutes)
  keyPrefix?: string; // Prefix for cache key
  keyGenerator?: (req: Request) => string; // Custom key generator
}

/**
 * Cache middleware for Express routes
 * Caches GET requests only
 */
export const cacheMiddleware = (options: CacheOptions = {}) => {
  const {
    ttl = 300, // 5 minutes default
    keyPrefix = 'cache',
    keyGenerator,
  } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const redis = getRedisClient();

    // If Redis is not available, skip caching
    if (!redis) {
      return next();
    }

    try {
      // Generate cache key
      const cacheKey = keyGenerator
        ? `${keyPrefix}:${keyGenerator(req)}`
        : `${keyPrefix}:${req.originalUrl || req.url}`;

      // Try to get cached data
      const cachedData = await redis.get(cacheKey);

      if (cachedData) {
        // Cache hit - return cached data
        const data = JSON.parse(cachedData);

        return res.status(200).json({
          ...data,
          _cached: true,
          _cacheKey: cacheKey,
        });
      }

      // Cache miss - intercept res.json to cache the response
      const originalJson = res.json.bind(res);

      res.json = (body: any) => {
        // Only cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          // Remove metadata before caching
          const { _cached, _cacheKey, ...dataToCache } = body;

          redis
            .setex(cacheKey, ttl, JSON.stringify(dataToCache))
            .catch((err) => {
              console.error('Error caching response:', err);
            });
        }

        return originalJson(body);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
};

/**
 * Cache utility functions
 */
export class CacheService {
  private redis = getRedisClient();
  private defaultTTL = 300; // 5 minutes

  /**
   * Get cached value by key
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.redis) return null;

    try {
      const data = await this.redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Set cache value with TTL
   */
  async set(key: string, value: any, ttl?: number): Promise<boolean> {
    if (!this.redis) return false;

    try {
      const serialized = JSON.stringify(value);
      await this.redis.setex(key, ttl || this.defaultTTL, serialized);
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  /**
   * Delete cache by key
   */
  async delete(key: string): Promise<boolean> {
    if (!this.redis) return false;

    try {
      await this.redis.del(key);
      return true;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  /**
   * Delete multiple cache keys by pattern
   */
  async deletePattern(pattern: string): Promise<number> {
    if (!this.redis) return 0;

    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length === 0) return 0;

      const result = await this.redis.del(...keys);
      return result;
    } catch (error) {
      console.error('Cache delete pattern error:', error);
      return 0;
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    if (!this.redis) return false;

    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Cache exists error:', error);
      return false;
    }
  }

  /**
   * Set TTL for existing key
   */
  async expire(key: string, ttl: number): Promise<boolean> {
    if (!this.redis) return false;

    try {
      await this.redis.expire(key, ttl);
      return true;
    } catch (error) {
      console.error('Cache expire error:', error);
      return false;
    }
  }

  /**
   * Flush all cache
   */
  async flush(): Promise<boolean> {
    if (!this.redis) return false;

    try {
      await this.redis.flushdb();
      return true;
    } catch (error) {
      console.error('Cache flush error:', error);
      return false;
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{ keys: number; memory: string } | null> {
    if (!this.redis) return null;

    try {
      const dbSize = await this.redis.dbsize();
      const info = await this.redis.info('memory');
      const memoryMatch = info.match(/used_memory_human:(.+)/);
      const memory = memoryMatch ? memoryMatch[1].trim() : 'unknown';

      return {
        keys: dbSize,
        memory,
      };
    } catch (error) {
      console.error('Cache stats error:', error);
      return null;
    }
  }
}

export const cacheService = new CacheService();
