
import expressServer from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth.routes';
import donorRoutes from './routes/donor.routes';
import inventoryRoutes from './routes/inventory.routes';
import hospitalRoutes from './routes/hospital.routes';
import requestRoutes from './routes/request.routes';
import appointmentRoutes from './routes/appointment.routes';
import collectionRoutes from './routes/collection.routes';
import dashboardRoutes from './routes/dashboard.routes';
import receptionRoutes from './routes/reception.routes';

import labRoutes from './routes/lab.routes';
import auditRoutes from './routes/audit.routes';
import notificationRoutes from './routes/notification.routes';
import certificateRoutes from './routes/certificate.routes';
import staffRoutes from './routes/staff.routes';
import milestoneRoutes from './routes/milestone.routes';
import path from 'path';

dotenv.config();

const app = expressServer();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

export const prisma = new PrismaClient();

app.use(cors());
app.use(expressServer.json());
app.use('/uploads', expressServer.static(path.join(__dirname, '../uploads')));

// Basic health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Blood Bank API is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/donors', donorRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/collection', collectionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reception', receptionRoutes);

app.use('/api/lab', labRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/milestones', milestoneRoutes);

// Socket.io for real-time updates
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

// We will inject real-time dispatcher into request context
app.use((req: any, res, next) => {
  req.io = io;
  next();
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
