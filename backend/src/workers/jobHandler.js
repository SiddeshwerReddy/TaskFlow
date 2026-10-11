import JobModel from '../models/Job.js';
import { processEmail } from './processors/emailProcessor.js';
import { processReport } from './processors/reportProcessor.js';
import { processImage } from './processors/imageProcessor.js';
import { processSimulation } from './processors/simulationProcessor.js';
import { publishJobUpdate } from './eventPublisher.js';

export const jobHandler = async (job) => {
  console.log(`[Worker] Picked up job ${job.id} of type ${job.name}`);

  // 1. Mark job as processing in MongoDB
  const updatedJob = await JobModel.findByIdAndUpdate(
    job.id, 
    {
      status: 'processing',
      startedAt: new Date(),
      attempts: job.attemptsMade + 1,
    },
    { returnDocument: 'before' }
  );

  if (updatedJob) {
    publishJobUpdate(updatedJob.userId, job.id, 'processing');
  }

  try {
    let result;
    // 2. Route to specific processor
    switch (job.name) {
      case 'email':
        result = await processEmail(job.data);
        break;
      case 'report':
        result = await processReport(job.data);
        break;
      case 'image':
        result = await processImage(job.data);
        break;
      case 'simulation':
        result = await processSimulation(job.data);
        break;
      default:
        throw new Error(`Unknown job type: ${job.name}`);
    }

    return result; // BullMQ automatically marks it as completed and attaches this result
  } catch (error) {
    console.error(`[Worker] Job ${job.id} failed:`, error.message);
    throw error; // BullMQ catches this and handles retries or marks as failed
  }
};
