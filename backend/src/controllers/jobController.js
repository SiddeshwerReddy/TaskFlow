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
