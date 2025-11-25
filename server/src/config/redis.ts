import Redis from 'ioredis';

let redisClient: Redis | null = null;

/**
 * Initialize Redis client
 */
export const initRedis = (): Redis | null => {
  const REDIS_URL = process.env.REDIS_URL;

  if (!REDIS_URL) {
    console.warn('Redis URL not configured, caching disabled');
    return null;
  }

  try {
    redisClient = new Redis(REDIS_URL, {
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
  } catch (error) {
    console.error('Failed to initialize Redis:', error);
    return null;
  }
};

/**
 * Get Redis client instance
 */
export const getRedisClient = (): Redis | null => {
  return redisClient;
};

/**
 * Close Redis connection
 */
export const closeRedis = async (): Promise<void> => {
  if (redisClient) {
    await redisClient.quit();
    console.log('Redis connection closed');
  }
};
