import { Request, Response } from 'express';
import { prisma } from '../server';

export const getAuditLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const logs = await prisma.auditLog.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100 // Limit for performance in this demo
    });
    res.json(logs);
  } catch (error) {
    console.error("AUDIT ERROR:", error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
};
