import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import authRoutes from './routes/authRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import { setupBullBoard } from './config/bullBoard.js';

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:8080'
].filter(Boolean);

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like health checks, Postman, curl)
    if (!origin) return callback(null, true);
    // Allow if FRONTEND_URL is not configured or matches allowed list
    if (!process.env.FRONTEND_URL || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

// Setup Bull-Board Admin UI
setupBullBoard(app);

// Basic Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'TaskFlow API is running' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);

export default app;
