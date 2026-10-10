import Redis from 'ioredis';
import { redisConnectionOptions } from '../config/redis.js';

// Dedicated publisher connection
const redisPub = new Redis(redisConnectionOptions);

export const publishJobUpdate = (userId, jobId, status, result = null, error = null) => {
  if (!userId) return;
  const payload = { userId, jobId, status, result, error };
  redisPub.publish('job-updates', JSON.stringify(payload)).catch((err) => {
    console.error('Failed to publish job update:', err);
  });
};
