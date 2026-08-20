import { createServer } from 'http';
import { Server } from 'socket.io';
import { app, prisma } from './app';

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

// We inject real-time dispatcher into request context BEFORE routes, specifically for Node dev
app.use((req: any, res, next) => {
  req.io = io;
  next();
});

// Socket.io for real-time updates (Local Development Only)
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  
  socket.on('join_room', (room) => {
    socket.join(room);
    console.log(`Socket ${socket.id} joined room ${room}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;

const server = httpServer.listen(PORT, () => {
  console.log(`Node Server running on port ${PORT} (Local Development)`);
});

// Graceful Shutdown
const gracefulShutdown = async (signal: string) => {
  console.log(`Received ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    console.log('HTTP server closed.');
    try {
      await prisma.$disconnect();
      console.log('Prisma disconnected.');
      process.exit(0);
    } catch (error) {
      console.error('Error during disconnection', error);
      process.exit(1);
    }
  });

  // Force close after 10 seconds
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export { prisma };
