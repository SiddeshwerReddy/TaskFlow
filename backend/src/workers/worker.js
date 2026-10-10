import 'dotenv/config';
import { Worker } from 'bullmq';
import { connectDB } from '../config/db.js';
import { redisConnectionOptions } from '../config/redis.js';
import { jobHandler } from './jobHandler.js';
import JobModel from '../models/Job.js';
import { publishJobUpdate } from './eventPublisher.js';

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
    const updatedJob = await JobModel.findByIdAndUpdate(job.id, {
      status: 'completed',
      result,
      completedAt: new Date(),
    }, { new: false });
    
    if (updatedJob) {
      publishJobUpdate(updatedJob.userId, job.id, 'completed', result);
    }
  });

  worker.on('failed', async (job, err) => {
    const isRetrying = job.attemptsMade < job.opts.attempts;
    const finalStatus = isRetrying ? 'retrying' : 'failed';

    if (isRetrying) {
      console.log(
        `[Worker] Job ${job.id} failed (Attempt ${job.attemptsMade}/${job.opts.attempts}). Retrying soon... Error: ${err.message}`
      );
    } else {
      console.log(
        `[Worker] Job ${job.id} failed completely after ${job.attemptsMade} attempts: ${err.message}`
      );
    }

    const updatedJob = await JobModel.findByIdAndUpdate(job.id, {
      status: finalStatus,
      error: err.message,
      attempts: job.attemptsMade,
    }, { new: false });
    
    if (updatedJob) {
      publishJobUpdate(updatedJob.userId, job.id, finalStatus, null, err.message);
    }
  });

  worker.on('error', (err) => {
    console.error(`[Worker Node Error]:`, err);
  });

  console.log(`[Worker] Listening for jobs on queue: ${QUEUE_NAME}`);

  // Graceful Shutdown Logic
  const gracefulShutdown = async (signal) => {
    console.log(`\n[${signal}] Received. Closing worker gracefully...`);
    await worker.close(); // Waits for active jobs to finish
    console.log('[Worker] BullMQ Worker closed.');
    process.exit(0);
  };

  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
};

startWorker();
