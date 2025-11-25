"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeRedis = exports.getRedisClient = exports.initRedis = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
let redisClient = null;
/**
 * Initialize Redis client
 */
const initRedis = () => {
    const REDIS_URL = process.env.REDIS_URL;
    if (!REDIS_URL) {
        console.warn('Redis URL not configured, caching disabled');
        return null;
    }
    try {
        redisClient = new ioredis_1.default(REDIS_URL, {
            maxRetriesPerRequest: 3,
            enableReadyCheck: true,
            retryStrategy(times) {
                const delay = Math.min(times * 50, 2000);
                return delay;
            },
            reconnectOnError(err) {
                const targetError = 'READONLY';
                if (err.message.includes(targetError)) {
                    // Only reconnect when the error contains "READONLY"
                    return true;
                }
                return false;
            },
        });
        redisClient.on('connect', () => {
            console.log('✅ Redis connected');
        });
        redisClient.on('error', (error) => {
            console.error('❌ Redis error:', error);
        });
        redisClient.on('ready', () => {
            console.log('✅ Redis ready to receive commands');
        });
        return redisClient;
    }
    catch (error) {
        console.error('Failed to initialize Redis:', error);
        return null;
    }
};
exports.initRedis = initRedis;
/**
 * Get Redis client instance
 */
const getRedisClient = () => {
    return redisClient;
};
exports.getRedisClient = getRedisClient;
/**
 * Close Redis connection
 */
const closeRedis = async () => {
    if (redisClient) {
        await redisClient.quit();
        console.log('Redis connection closed');
    }
};
exports.closeRedis = closeRedis;
//# sourceMappingURL=redis.js.map