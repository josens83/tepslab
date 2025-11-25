import Redis from 'ioredis';
/**
 * Initialize Redis client
 */
export declare const initRedis: () => Redis | null;
/**
 * Get Redis client instance
 */
export declare const getRedisClient: () => Redis | null;
/**
 * Close Redis connection
 */
export declare const closeRedis: () => Promise<void>;
//# sourceMappingURL=redis.d.ts.map