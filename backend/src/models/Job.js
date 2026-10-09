import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
      index: true,
    },
    bullJobId: {
      type: String,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['email', 'report', 'image', 'simulation'],
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    status: {
      type: String,
      enum: ['queued', 'processing', 'completed', 'failed', 'cancelled', 'retrying'],
      default: 'queued',
      index: true,
    },
    result: {
      type: mongoose.Schema.Types.Mixed,
    },
    error: {
      type: String,
    },
    progress: {
      type: Number,
      default: 0,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    startedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

const Job = mongoose.model('Job', jobSchema);
export default Job;
