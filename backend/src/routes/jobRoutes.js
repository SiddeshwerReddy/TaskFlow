import express from 'express';
import { createJob, listJobs } from '../controllers/jobController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All job routes require authentication
router.route('/').post(protect, createJob).get(protect, listJobs);

export default router;
