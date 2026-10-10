import 'dotenv/config';
import http from 'http';
import { Server } from 'socket.io';
import Redis from 'ioredis';
import app from './app.js';
import { connectDB } from './config/db.js';
import { jobQueue } from './queues/jobQueue.js'; 

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  // Create HTTP Server wrapping Express app
  const httpServer = http.createServer(app);

  // Initialize Socket.io
  const io = new Server(httpServer, {
    cors: {
      origin: '*', // For dev, allow all origins
      methods: ['GET', 'POST']
    }
  });

  // Handle Client Connections
  io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId) {
      socket.join(userId); // Join a private room for this user
      console.log(`[Socket] User ${userId} connected`);
    }

    socket.on('disconnect', () => {
      console.log(`[Socket] User ${userId} disconnected`);
    });
  });

  // Setup Redis Subscriber for Worker events
  const redisSub = new Redis(process.env.REDIS_URI || 'redis://127.0.0.1:6379');
  redisSub.subscribe('job-updates');
  
  redisSub.on('message', (channel, message) => {
    if (channel === 'job-updates') {
      const data = JSON.parse(message);
      if (data.userId) {
        // Broadcast the update ONLY to the specific user's room
        io.to(data.userId.toString()).emit('job-updated', data);
      }
    }
  });

  httpServer.listen(PORT, () => {
    console.log(`Server (HTTP & WebSocket) is running on port ${PORT}`);
  });
};

startServer();
