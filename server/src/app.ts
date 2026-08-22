import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { v4 as uuidv4 } from 'uuid';
import { PrismaClient } from '@prisma/client';
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

import { AsyncLocalStorage } from 'node:async_hooks';

const als = new AsyncLocalStorage<PrismaClient>();

export const prisma = new Proxy({} as PrismaClient, {
  get(target, prop) {
    const p = als.getStore();
    if (!p) {
      // Fallback for readiness check or outside context
      return undefined;
    }
    const value = (p as any)[prop];
    if (typeof value === 'function') {
      return value.bind(p);
    }
    return value;
  }
});

export const app = new Hono();

// CORS Middleware
app.use('*', cors({
  origin: process.env.NODE_ENV === 'production' && process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL
    : '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
}));

// Prisma Request-Scoped Context Middleware
app.use('*', async (c, next) => {
  // Use a temporary standalone Prisma connection for this request
  const connectionString = process.env.DATABASE_URL!;
  const pool = new Pool({
    connectionString,
    max: 1, // Only 1 connection needed for the request
    idleTimeoutMillis: 0,
    connectionTimeoutMillis: 10000
  });
  const adapter = new PrismaPg(pool);
  const prismaClient = new PrismaClient({ adapter });

  await als.run(prismaClient, async () => {
    await next();
  });

  // Clean up socket to prevent hangs on Cloudflare Workers
  c.executionCtx.waitUntil(
    prismaClient.$disconnect().then(() => pool.end())
  );
});

// Correlation ID Middleware
app.use('*', async (c, next) => {
  const reqId = c.req.header('x-request-id') || uuidv4();
  c.header('X-Request-ID', reqId);
  await next();
});

// Liveness endpoint
app.get('/health', (c) => {
  return c.json({ status: 'OK', message: 'Blood Bank API is alive (Cloudflare Worker)' }, 200);
});

// Readiness endpoint
app.get('/ready', async (c) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    return c.json(
      {
        status: 'READY',
        message: 'Database connection established'
      },
      200
    );
  } catch (error) {
    console.error('DATABASE READY CHECK ERROR:', error);

    return c.json(
      {
        status: 'UNAVAILABLE',
        message: 'Database unreachable'
      },
      503
    );
  }
});
app.get('/test-db', async (c) => {
  try {
    const user = await prisma.user.findFirst();
    return c.json({ success: true, user: user?.email }, 200);
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

// Routes
app.route('/api/auth', authRoutes.honoApp);
app.route('/api/donors', donorRoutes.honoApp);
app.route('/api/inventory', inventoryRoutes.honoApp);
app.route('/api/hospitals', hospitalRoutes.honoApp);
app.route('/api/requests', requestRoutes.honoApp);
app.route('/api/appointments', appointmentRoutes.honoApp);
app.route('/api/collection', collectionRoutes.honoApp);
app.route('/api/dashboard', dashboardRoutes.honoApp);
app.route('/api/reception', receptionRoutes.honoApp);
app.route('/api/lab', labRoutes.honoApp);
app.route('/api/audit', auditRoutes.honoApp);
app.route('/api/notifications', notificationRoutes.honoApp);
app.route('/api/certificates', certificateRoutes.honoApp);
app.route('/api/staff', staffRoutes.honoApp);
app.route('/api/milestones', milestoneRoutes.honoApp);
app.route('/api/camps', campRoutes.honoApp);
app.route('/api/reports', reportRoutes.honoApp);

app.get('/api/documents/download/:filename', async (c) => {
  return c.json({ error: 'Secure download requires authenticated endpoint.' }, 403);
});
