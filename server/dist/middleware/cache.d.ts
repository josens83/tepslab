import { Request, Response, NextFunction } from 'express';
export interface CacheOptions {
    ttl?: number;
    keyPrefix?: string;
    keyGenerator?: (req: Request) => string;
}
/**
 * Cache middleware for Express routes
 * Caches GET requests only
 */
export declare const cacheMiddleware: (options?: CacheOptions) => (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
/**
 * Cache utility functions
 */
export declare class CacheService {
    private redis;
    private defaultTTL;
    /**
     * Get cached value by key
     */
    get<T>(key: string): Promise<T | null>;
    /**
     * Set cache value with TTL
     */
    set(key: string, value: any, ttl?: number): Promise<boolean>;
    /**
     * Delete cache by key
     */
    delete(key: string): Promise<boolean>;
    /**
     * Delete multiple cache keys by pattern
     */
    deletePattern(pattern: string): Promise<number>;
    /**
     * Check if key exists
     */
    exists(key: string): Promise<boolean>;
    /**
     * Set TTL for existing key
     */
    expire(key: string, ttl: number): Promise<boolean>;
    /**
     * Flush all cache
     */
    flush(): Promise<boolean>;
    /**
     * Get cache statistics
     */
    getStats(): Promise<{
        keys: number;
        memory: string;
    } | null>;
}
export declare const cacheService: CacheService;
//# sourceMappingURL=cache.d.ts.map