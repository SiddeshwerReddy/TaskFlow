import Job from '../models/Job.js';
import { jobQueue } from '../queues/jobQueue.js';

export const createJob = async (req, res) => {
  try {
    const { type, data } = req.body;

    // Validate type
    const validTypes = ['email', 'report', 'image', 'simulation'];
    if (!validTypes.includes(type)) {
      return res
        .status(400)
        .json({ message: `Invalid job type. Must be one of: ${validTypes.join(', ')}` });
    }

    // 1. Create a Job record in MongoDB
    const jobRecord = await Job.create({
      userId: req.user._id,
      type,
      data,
      status: 'queued',
    });

    // 2. Add the job to BullMQ
    // We pass the MongoDB document ID as the custom BullMQ jobId
    const bullJob = await jobQueue.add(type, data, {
      jobId: jobRecord._id.toString(), // Keep IDs in sync
    });

    // 3. Update the MongoDB record with the BullMQ ID
    jobRecord.bullJobId = bullJob.id;
    await jobRecord.save();

    res.status(201).json({
      message: 'Job submitted successfully',
      job: jobRecord,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const listJobs = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const status = req.query.status;

    // Build the query
    const query = { userId: req.user._id };
    if (status) {
      query.status = status;
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const jobs = await Job.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);

    // Get total count for pagination metadata
    const total = await Job.countDocuments(query);

    res.json({
      jobs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const cancelJob = async (req, res) => {
  try {
    const jobRecord = await Job.findOne({ _id: req.params.id, userId: req.user._id });
    if (!jobRecord) return res.status(404).json({ message: 'Job not found' });

    if (['completed', 'failed', 'cancelled'].includes(jobRecord.status)) {
      return res
        .status(400)
        .json({ message: `Cannot cancel a job with status: ${jobRecord.status}` });
    }

    // Try to remove from BullMQ
    if (jobRecord.bullJobId) {
      const bullJob = await jobQueue.getJob(jobRecord.bullJobId);
      if (bullJob) {
        const state = await bullJob.getState();
        if (state === 'active') {
          return res
            .status(400)
            .json({ message: 'Job is currently processing and cannot be cancelled directly.' });
        }
        await bullJob.remove(); // Removes it from waiting/delayed queues
      }
    }

    jobRecord.status = 'cancelled';
    await jobRecord.save();

    res.json({ message: 'Job cancelled successfully', job: jobRecord });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const retryJob = async (req, res) => {
  try {
    const jobRecord = await Job.findOne({ _id: req.params.id, userId: req.user._id });
    if (!jobRecord) return res.status(404).json({ message: 'Job not found' });

    if (jobRecord.status !== 'failed' && jobRecord.status !== 'cancelled') {
      return res
        .status(400)
        .json({ message: 'Only failed or cancelled jobs can be manually retried' });
    }

    let bullJob = null;
    if (jobRecord.bullJobId) {
      bullJob = await jobQueue.getJob(jobRecord.bullJobId);
    }

    if (bullJob && (await bullJob.getState()) === 'failed') {
      // Natively retry the failed BullMQ job
      await bullJob.retry();
      jobRecord.status = 'queued';
      jobRecord.attempts = 0;
      jobRecord.error = undefined;
      await jobRecord.save();
    } else {
      // If it was removed from Redis or cancelled before executing, recreate it in BullMQ
      bullJob = await jobQueue.add(jobRecord.type, jobRecord.data, {
        jobId: jobRecord._id.toString(),
      });
      jobRecord.bullJobId = bullJob.id;
      jobRecord.status = 'queued';
      jobRecord.attempts = 0;
      jobRecord.error = undefined;
      await jobRecord.save();
    }

    res.json({ message: 'Job queued for retry', job: jobRecord });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
