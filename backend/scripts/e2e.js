import 'dotenv/config';
import mongoose from 'mongoose';
import app from '../src/app.js';
import JobModel from '../src/models/Job.js';
import User from '../src/models/User.js';
import { jobQueue } from '../src/queues/jobQueue.js';
import { Worker } from 'bullmq';
import { redisConnectionOptions } from '../src/config/redis.js';
import { jobHandler } from '../src/workers/jobHandler.js';

const PORT = 5005; // Use a different port for testing to avoid conflicts

const runE2E = async () => {
  console.log('--- Starting End-to-End Test ---');

  try {
    // 1. Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/taskflow');
    console.log('✅ Connected to MongoDB');

    // 2. Clear previous test data
    await User.deleteMany({ email: 'e2e@example.com' });
    console.log('✅ Cleared old test user');

    // 3. Start the Express Server
    const server = app.listen(PORT, () => console.log(`✅ API Server running on port ${PORT}`));

    // 4. Start the Worker Service
    const worker = new Worker('taskflow-jobs', jobHandler, {
      connection: redisConnectionOptions,
    });

    // Add global event listeners for the worker
    worker.on('completed', async (job, result) => {
      await JobModel.findByIdAndUpdate(job.id, {
        status: 'completed',
        result,
        completedAt: new Date(),
      });
      console.log(`✅ Worker completed job ${job.id}`);
    });
    worker.on('failed', async (job, err) => {
      await JobModel.findByIdAndUpdate(job.id, { status: 'failed', error: err.message });
      console.log(`❌ Worker failed job ${job.id}`);
    });

    console.log('✅ Worker started');

    // 5. Register a User
    const registerRes = await fetch(`http://localhost:${PORT}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'E2E Tester',
        email: 'e2e@example.com',
        password: 'password123',
      }),
    });

    if (!registerRes.ok) {
      throw new Error(`Registration failed: ${await registerRes.text()}`);
    }

    const { token } = await registerRes.json();
    console.log('✅ User registered and JWT token received');

    // 6. Submit a Job via API
    const jobRes = await fetch(`http://localhost:${PORT}/api/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ type: 'simulation', data: { delay: 2000, shouldFail: false } }),
    });

    if (!jobRes.ok) {
      throw new Error(`Job submission failed: ${await jobRes.text()}`);
    }

    const jobData = await jobRes.json();
    const jobId = jobData.job._id;
    console.log(`✅ Job submitted via API. Job ID: ${jobId}. Status: ${jobData.job.status}`);

    // 7. Poll the database for completion
    let jobRecord;
    for (let i = 0; i < 10; i++) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      jobRecord = await JobModel.findById(jobId);
      console.log(`⏳ Job status: ${jobRecord.status}`);
      if (jobRecord.status === 'completed' || jobRecord.status === 'failed') {
        break;
      }
    }

    if (jobRecord.status === 'completed') {
      console.log('🎉 E2E Test Passed: Job processed successfully!');
    } else {
      console.error('💥 E2E Test Failed: Job did not complete in time or failed.');
    }

    // Cleanup
    await worker.close();
    await jobQueue.close();
    server.close();
    await mongoose.disconnect();
    console.log('--- E2E Test Finished ---');
    process.exit(0);
  } catch (err) {
    console.error('Error in E2E test:', err);
    process.exit(1);
  }
};

runE2E();
