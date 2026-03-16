import Redis from 'ioredis';

const isRemoteRedis = !!(process.env.REDIS_PASSWORD);

const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
  // Upstash and other cloud Redis providers require TLS
  tls: isRemoteRedis ? {} : undefined,
  maxRetriesPerRequest: 3,
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  reconnectOnError: (err: Error) => {
    const targetError = 'READONLY';
    if (err.message.includes(targetError)) {
      return true;
    }
    return false;
  },
};

// Create Redis client
export const redis = new Redis(redisConfig);

// Handle Redis errors
redis.on('error', (error) => {
  console.error('Redis connection error:', error);
});

redis.on('connect', () => {
  console.log('Redis connected successfully');
});

redis.on('ready', () => {
  console.log('Redis ready to accept commands');
});

redis.on('reconnecting', () => {
  console.log('Redis reconnecting...');
});

// Graceful shutdown
export const closeRedis = async (): Promise<void> => {
  await redis.quit();
  console.log('Redis connection closed');
};

export default redis;
