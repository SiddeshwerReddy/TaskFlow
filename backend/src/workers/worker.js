import 'dotenv/config';
import { Worker } from 'bullmq';
import { connectDB } from '../config/db.js';
import { redisConnectionOptions } from '../config/redis.js';
import { jobHandler } from './jobHandler.js';
import JobModel from '../models/Job.js';

const QUEUE_NAME = 'taskflow-jobs';

const startWorker = async () => {
  console.log('Starting Worker Service...');

  // Connect to MongoDB
  await connectDB();

  // Initialize BullMQ Worker
  const worker = new Worker(QUEUE_NAME, jobHandler, {
    connection: redisConnectionOptions,
    concurrency: 5, // Process up to 5 jobs concurrently
  });

  // Listen to Global Worker Events to update MongoDB
  worker.on('completed', async (job, result) => {
    console.log(`[Worker] Job ${job.id} completed successfully`);
    await JobModel.findByIdAndUpdate(job.id, {
      status: 'completed',
      result,
      completedAt: new Date(),
    });
  });

  worker.on('failed', async (job, err) => {
    console.log(`[Worker] Job ${job.id} failed: ${err.message}`);
    // If it has retries left, BullMQ will retry it. Otherwise, it fails completely.
    const isRetrying = job.attemptsMade < job.opts.attempts;

    await JobModel.findByIdAndUpdate(job.id, {
      status: isRetrying ? 'retrying' : 'failed',
      error: err.message,
    });
  });

  worker.on('error', (err) => {
    console.error(`[Worker Node Error]:`, err);
  });

  console.log(`[Worker] Listening for jobs on queue: ${QUEUE_NAME}`);
};

startWorker();
