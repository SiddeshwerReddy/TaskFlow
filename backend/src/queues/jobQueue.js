import { Queue } from 'bullmq';
import { redisConnectionOptions } from '../config/redis.js';

const QUEUE_NAME = 'taskflow-jobs';

// Initialize the BullMQ Queue
export const jobQueue = new Queue(QUEUE_NAME, {
  connection: redisConnectionOptions,
});

// Generic error handler
jobQueue.on('error', (err) => {
  console.error(`Queue Error (${QUEUE_NAME}):`, err.message);
});

console.log(`[Queue] BullMQ Queue '${QUEUE_NAME}' initialized.`);
