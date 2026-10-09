import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Basic Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'TaskFlow API is running' });
});

export default app;
