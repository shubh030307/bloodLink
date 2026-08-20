import { Request, Response } from 'express';
import { prisma } from '../app';

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

    // Calculate last 6 months analytics
    const chartData = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const startOfMonth = new Date(d.getFullYear(), d.getMonth(), 1);
      const endOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
      
      const donations = await prisma.donation.count({
        where: { collectionDate: { gte: startOfMonth, lte: endOfMonth } }
      });
      
      const requests = await prisma.bloodRequest.count({
        where: { requestedAt: { gte: startOfMonth, lte: endOfMonth } }
      });
      
      chartData.push({
        name: monthNames[d.getMonth()],
        donations,
        requests
      });
    }

    // Available blood groups
    const inventoryGroups = await prisma.bloodUnit.groupBy({
      by: ['bloodGroup'],
      where: { status: 'AVAILABLE' },
      _count: { bloodGroup: true }
    });

    const inventoryByGroup = inventoryGroups.map(g => ({
      name: g.bloodGroup,
      value: g._count.bloodGroup
    }));

    res.json({
      totalDonors,
      todaysAppointments,
      todaysCheckins,
      availableUnits,
      pendingRequests,
      emergencyRequests,
      chartData,
      inventoryByGroup
    });
  } catch (error) {
    console.error("ADMIN DASHBOARD ERROR:", error);
    res.status(500).json({ error: 'Failed to fetch admin stats' });
  }
};
