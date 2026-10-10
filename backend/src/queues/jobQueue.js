import { Queue } from 'bullmq';
import { redisConnectionOptions } from '../config/redis.js';

const QUEUE_NAME = 'taskflow-jobs';

// Initialize the BullMQ Queue with default options for Retries and Backoff
export const jobQueue = new Queue(QUEUE_NAME, {
  connection: redisConnectionOptions,
  defaultJobOptions: {
    attempts: 3, // Retry failed jobs up to 3 times
    backoff: {
      type: 'exponential',
      delay: 2000, // Wait 2s, then 4s, then 8s before retrying
    },
    removeOnComplete: false, // Keep for history/debugging
    removeOnFail: false,
  },
});

// Generic error handler
jobQueue.on('error', (err) => {
  console.error(`Queue Error (${QUEUE_NAME}):`, err.message);
});

console.log(`[Queue] BullMQ Queue '${QUEUE_NAME}' initialized.`);
