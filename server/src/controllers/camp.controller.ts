import { Request, Response } from 'express';
import { prisma } from '../app';

export const createCamp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, date, startTime, endTime, location, capacity, slotDuration } = req.body;

    // Validate times
    const start = new Date(startTime);
    const end = new Date(endTime);
    if (start >= end) {
      res.status(400).json({ error: 'Start time must be before end time' });
      return;
    }

    // Strict overlap protection for camps at the same location on the same day
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const overlapping = await prisma.bloodCamp.findFirst({
      where: {
        location,
        date: { gte: dayStart, lt: dayEnd },
        status: { not: 'CANCELLED' },
        AND: [
          { startTime: { lt: end } },
          { endTime: { gt: start } }
        ]
      }
    });

    if (overlapping) {
      res.status(409).json({ error: 'A camp already exists at this location during the specified time' });
      return;
    }

    // Transaction to safely create camp and its generated slots
    const result = await prisma.$transaction(async (tx) => {
      const camp = await tx.bloodCamp.create({
        data: {
          name,
          date: new Date(date),
          startTime: start,
          endTime: end,
          location,
          capacity: capacity || 100,
          slotDuration: slotDuration || 30,
          status: 'OPEN'
        }
      });

      // Generate Slots dynamically
      const slotsData = [];
      let current = new Date(start);
      const durMs = (slotDuration || 30) * 60000;
      
      // Calculate capacity per slot safely
      const totalSlots = Math.floor((end.getTime() - start.getTime()) / durMs);
      const capacityPerSlot = totalSlots > 0 ? Math.ceil((capacity || 100) / totalSlots) : 5;

      while (current < end) {
        const next = new Date(current.getTime() + durMs);
        if (next <= end) {
          slotsData.push({
            campId: camp.id,
            date: new Date(date),
            startTime: current,
            endTime: next,
            capacity: capacityPerSlot
          });
        }
        current = next;
      }

      if (slotsData.length > 0) {
        await tx.donationSlot.createMany({ data: slotsData });
      }

      return camp;
    });

    res.status(201).json({ success: true, camp: result });
  } catch (error) {
    console.error("CREATE CAMP ERROR:", error);
    res.status(500).json({ error: 'Failed to create camp' });
  }
};

export const getCamps = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, date } = req.query;
    let where: any = {};
    if (status) where.status = status;
    if (date) {
      const d = new Date(date as string);
      d.setHours(0,0,0,0);
      const nextDay = new Date(d);
      nextDay.setDate(d.getDate() + 1);
      where.date = { gte: d, lt: nextDay };
    }

    const camps = await prisma.bloodCamp.findMany({ 
      where, 
      orderBy: { date: 'asc' },
      include: {
        _count: {
          select: { appointments: true }
        }
      }
    });
    res.json(camps);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch camps' });
  }
};

export const getCampById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const camp = await prisma.bloodCamp.findUnique({
      where: { id: id as string },
      include: {
        donationSlots: {
          include: {
            _count: { select: { appointments: true } }
          },
          orderBy: { startTime: 'asc' }
        }
      }
    });

    if (!camp) {
      res.status(404).json({ error: 'Camp not found' });
      return;
    }

    res.json(camp);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch camp details' });
  }
};

export const updateCampStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['OPEN', 'CANCELLED', 'COMPLETED'].includes(status)) {
      res.status(400).json({ error: 'Invalid status' });
      return;
    }

    const updated = await prisma.bloodCamp.update({
      where: { id: id as string },
      data: { status }
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update camp status' });
  }
};
