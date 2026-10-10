import express from 'express';
import { createJob, listJobs, cancelJob, retryJob } from '../controllers/jobController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All job routes require authentication
router.route('/').post(protect, createJob).get(protect, listJobs);

router.post('/:id/cancel', protect, cancelJob);
router.post('/:id/retry', protect, retryJob);

export default router;
