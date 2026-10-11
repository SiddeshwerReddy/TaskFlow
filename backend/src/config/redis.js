import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URI || process.env.REDIS_URL;

export const redisConnectionOptions = redisUrl
  ? {
      ...new Redis(redisUrl, { lazyConnect: true }).options,
      maxRetriesPerRequest: null,
    }
  : {
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379,
      maxRetriesPerRequest: null,
    };
