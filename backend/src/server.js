import 'dotenv/config'; // Load environment variables before other imports
import app from './app.js';
import { connectDB } from './config/db.js';
import { jobQueue } from './queues/jobQueue.js'; // Ensure queue connects on startup

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Connect to database
  await connectDB();

  // Start Express server
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer();
