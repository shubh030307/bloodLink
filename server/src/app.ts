import expressServer from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { v4 as uuidv4 } from 'uuid';
import { PrismaClient } from '@prisma/client';
// Cloudflare edge imports (will be used if adapter-pg is active)
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

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
import campRoutes from './routes/camp.routes';
import reportRoutes from './routes/report.routes';

dotenv.config();

let prismaInstance: PrismaClient | null = null;

const getPrisma = () => {
  if (!prismaInstance) {
    const isCloudflare = process.env.CLOUDFLARE_WORKER === 'true';
    
    if (isCloudflare) {
      // Use Edge-compatible PG driver
      const connectionString = process.env.DATABASE_URL!;
      const pool = new Pool({ 
        connectionString,
        max: 15,
        idleTimeoutMillis: 1, // Close immediately on edge
        connectionTimeoutMillis: 5000,
        allowExitOnIdle: true
      });
      const adapter = new PrismaPg(pool);
      prismaInstance = new PrismaClient({ adapter });
    } else {
      // Use standard Prisma engine for local Node.js
      prismaInstance = new PrismaClient({
        datasources: {
          db: {
            url: process.env.DATABASE_URL
          }
        }
      });
    }
  }
  return prismaInstance;
};

export const prisma = new Proxy({} as PrismaClient, {
  get(target, prop) {
    const p = getPrisma();
    const value = (p as any)[prop];
    if (typeof value === 'function') {
      return value.bind(p);
    }
    return value;
  }
});

export const app = expressServer();

// Security Middlewares
app.use(helmet());

let apiLimiterInstance: any = null;
const apiLimiter = (req: any, res: any, next: any) => {
  if (typeof navigator !== 'undefined' && navigator.userAgent === 'Cloudflare-Workers') {
    return next();
  }
  if (!apiLimiterInstance) {
    apiLimiterInstance = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      message: 'Too many requests from this IP, please try again after 15 minutes',
      standardHeaders: true,
      legacyHeaders: false,
    });
  }
  return apiLimiterInstance(req, res, next);
};

app.use('/api/', apiLimiter);

app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
}));
app.use(expressServer.json({ limit: '10mb' }));

// Correlation ID Middleware
app.use((req, res, next) => {
  const reqId = req.headers['x-request-id'] || uuidv4();
  req.headers['x-request-id'] = reqId;
  res.setHeader('X-Request-ID', reqId as string);
  next();
});

// We inject req.io here as a fallback so it doesn't crash existing code, 
// though standard Socket.IO emitting won't work in CF Workers.
app.use((req: any, res, next) => {
  // io is only available in server.ts (Node environment).
  req.io = null; 
  next();
});

// Liveness endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Blood Bank API is alive' });
});

// Readiness endpoint
app.get('/ready', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: 'READY', message: 'Database connection established' });
  } catch (error) {
    res.status(503).json({ status: 'UNAVAILABLE', message: 'Database unreachable' });
  }
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
app.use('/api/camps', campRoutes);
app.use('/api/reports', reportRoutes);

app.get('/api/documents/download/:filename', async (req: any, res) => {
  res.status(403).json({ error: 'Secure download requires authenticated endpoint.' });
});
