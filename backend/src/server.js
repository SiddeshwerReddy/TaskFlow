import 'dotenv/config';
import http from 'http';
import { Server } from 'socket.io';
import Redis from 'ioredis';
import app from './app.js';
import { connectDB } from './config/db.js';
import { jobQueue } from './queues/jobQueue.js'; 
import { redisConnectionOptions } from './config/redis.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  // Create HTTP Server wrapping Express app
  const httpServer = http.createServer(app);

  // Initialize Socket.io
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL ? [process.env.FRONTEND_URL, 'http://localhost:5173', 'http://localhost:8080'] : '*',
      methods: ['GET', 'POST'],
      credentials: true
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
  const redisSub = new Redis(redisConnectionOptions);

  redisSub.on('error', (err) => {
    console.error('[Redis Subscriber Error]:', err.message);
  });

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
