import { Request, Response } from 'express';
import { prisma } from '../server';

export const getPendingScreenings = async (req: Request, res: Response): Promise<void> => {
  try {
    const visits = await prisma.visit.findMany({
      where: {
        status: 'WAITING_FOR_SCREENING'
      },
      include: {
        appointment: {
          include: {
            donor: {
              include: { user: { select: { name: true, email: true } }, emergencyContact: true }
            }
          }
        }
      },
      orderBy: { id: 'asc' }
    });

    res.json(visits);
  } catch (error) {
    console.error("MEDICAL ERROR:", error);
    res.status(500).json({ error: 'Failed to fetch pending screenings' });
  }
};

export const startScreening = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = (req as any).user;
    const visitId = req.params.visitId as string;

    const visit = await prisma.visit.findUnique({ where: { id: visitId } });
    if (!visit || visit.status !== 'WAITING_FOR_SCREENING') {
      res.status(400).json({ error: 'Visit is not waiting for screening' });
      return;
    }

    const updatedVisit = await prisma.visit.update({
      where: { id: visitId },
      data: {
        status: 'MEDICAL_SCREENING',
        medicalStaffId: userId
      }
    });

    await prisma.auditLog.create({
      data: {
        action: 'START_SCREENING',
        userId: userId,
        role: 'MedicalStaff',
        entity: 'Visit',
        entityId: visitId,
        prevStatus: 'WAITING_FOR_SCREENING',
        newStatus: 'MEDICAL_SCREENING',
      }
    });

    res.json(updatedVisit);
  } catch (error) {
    console.error("MEDICAL ERROR:", error);
    res.status(500).json({ error: 'Failed to start screening' });
  }
};

export const completeScreening = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = (req as any).user;
    const visitId = req.params.visitId as string;
    const { decision, remarks } = req.body; // decision: 'MEDICALLY_CLEARED' | 'DEFERRED'

    if (!['MEDICALLY_CLEARED', 'DEFERRED'].includes(decision)) {
      res.status(400).json({ error: 'Invalid decision' });
      return;
    }

    const visit = await prisma.visit.findUnique({ where: { id: visitId } });
    if (!visit || visit.status !== 'MEDICAL_SCREENING') {
      res.status(400).json({ error: 'Visit is not in screening state' });
      return;
    }

    const updatedVisit = await prisma.visit.update({
      where: { id: visitId },
      data: {
        status: decision === 'MEDICALLY_CLEARED' ? 'WAITING_FOR_COLLECTION' : 'DEFERRED',
        medicalRemarks: remarks
      }
    });

    await prisma.auditLog.create({
      data: {
        action: 'COMPLETE_SCREENING',
        userId: userId,
        role: 'MedicalStaff',
        entity: 'Visit',
        entityId: visitId,
        prevStatus: 'MEDICAL_SCREENING',
        newStatus: updatedVisit.status,
        details: remarks
      }
    });

    res.json(updatedVisit);
  } catch (error) {
    console.error("MEDICAL ERROR:", error);
    res.status(500).json({ error: 'Failed to complete screening' });
  }
};
