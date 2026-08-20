import { Request, Response } from 'express';
import { prisma } from '../app';

export const getInventory = async (req: Request, res: Response): Promise<void> => {
  try {
    const units = await prisma.bloodUnit.findMany({
      where: {
        status: { in: ['AVAILABLE', 'RESERVED'] }
      },
      include: {
        collectionCenter: true,
        labReport: true
      },
      orderBy: { expiryDate: 'asc' }
    });

    res.json({ inventory: units });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
};

export const getInventoryStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const units = await prisma.bloodUnit.findMany({
      where: {
        status: 'AVAILABLE'
      }
    });

    const stats = units.reduce((acc: any, unit) => {
      acc[unit.bloodGroup] = (acc[unit.bloodGroup] || 0) + 1;
      return acc;
    }, {});

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch inventory stats' });
  }
};
