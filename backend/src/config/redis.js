import Redis from 'ioredis';

let redisUrl = process.env.REDIS_URI || process.env.REDIS_URL;

if (redisUrl) {
  // Extract clean redis:// or rediss:// URL if user pasted CLI command or extra flags
  const match = redisUrl.match(/(rediss?:\/\/[^\s'"@]+@[^\s'"]+)/) || redisUrl.match(/(rediss?:\/\/[^\s'"]+)/);
  if (match) {
    redisUrl = match[match.length - 1];
  }
  // Upstash requires rediss:// (with double 's' for TLS)
  if (redisUrl.includes('upstash.io') && redisUrl.startsWith('redis://')) {
    redisUrl = redisUrl.replace('redis://', 'rediss://');
  }
}

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
