import * as Bull from 'bull';
import { QueueOptions, JobOptions } from 'bull';

const isRemoteRedis = !!(process.env.REDIS_PASSWORD);

// Redis connection configuration for Bull
export const redisConnection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
  // Upstash and other cloud Redis providers require TLS
  tls: isRemoteRedis ? {} : undefined,
};

// Default queue options
export const defaultQueueOptions: QueueOptions = {
  redis: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: 100, // Keep last 100 completed jobs
    removeOnFail: 500, // Keep last 500 failed jobs
  },
};

// Job-specific options
export const jobOptions: Record<string, JobOptions> = {
  email: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    timeout: 30000, // 30 seconds
  },
  documentProcessing: {
    attempts: 2,
    backoff: {
      type: 'exponential',
      delay: 3000,
    },
    timeout: 120000, // 2 minutes
  },
  ai: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 10000,
    },
    timeout: 180000, // 3 minutes
  },
};

// Helper to create a queue with standard configuration
export const createQueue = (name: string, options?: QueueOptions) => {
  // Bull can be imported as a namespace, but the constructor is the default export
  const Queue = (Bull as any).default || Bull;
  return new Queue(name, {
    ...defaultQueueOptions,
    ...options,
  });
};
