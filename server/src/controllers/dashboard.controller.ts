import { Request, Response } from 'express';
import { prisma } from '../server';

export const getAdminStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const totalDonors = await prisma.donor.count();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setDate(today.getDate() + 1);

    const todaysAppointments = await prisma.appointment.count({
      where: { date: { gte: today, lt: endOfDay } }
    });

    const todaysCheckins = await prisma.visit.count({
      where: {
        appointment: { date: { gte: today, lt: endOfDay } },
        status: { not: 'CHECKED_IN' } // Meaning they moved past check-in or are at check-in
      }
    });

    const availableUnits = await prisma.bloodUnit.count({
      where: { status: 'AVAILABLE' }
    });

    const pendingRequests = await prisma.bloodRequest.count({
      where: { status: 'PENDING' }
    });

    const emergencyRequests = await prisma.bloodRequest.count({
      where: { urgency: 'EMERGENCY', status: 'PENDING' }
    });

    res.json({
      totalDonors,
      todaysAppointments,
      todaysCheckins,
      availableUnits,
      pendingRequests,
      emergencyRequests
    });
  } catch (error) {
    console.error("ADMIN DASHBOARD ERROR:", error);
    res.status(500).json({ error: 'Failed to fetch admin stats' });
  }
};
