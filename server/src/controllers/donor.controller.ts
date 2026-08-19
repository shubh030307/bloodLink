import { Request, Response } from 'express';
import { prisma } from '../server';

export const getDonorProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = (req as any).user;
    const donor = await prisma.donor.findUnique({
      where: { userId },
      include: {
        user: { select: { name: true, email: true } },
        emergencyContact: true,
        milestones: true
      }
    });

    if (!donor) {
      res.status(404).json({ error: 'Donor profile not found' });
      return;
    }

    res.json(donor);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch donor profile' });
  }
};

export const getDonorHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = (req as any).user;
    const donor = await prisma.donor.findUnique({ where: { userId } });
    
    if (!donor) {
      res.status(404).json({ error: 'Donor profile not found' });
      return;
    }

    const visits = await prisma.visit.findMany({
      where: {
        appointment: { donorId: donor.id }
      },
      include: {
        appointment: { include: { bloodBank: true } },
        donations: { include: { bloodUnits: true } }
      },
      orderBy: { id: 'desc' }
    });

    res.json(visits);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
};

export const getAllDonors = async (req: Request, res: Response): Promise<void> => {
  try {
    const donors = await prisma.donor.findMany({
      include: {
        user: {
          select: { name: true, email: true }
        }
      },
      orderBy: { donorNumber: 'asc' }
    });
    res.json(donors);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch donors' });
  }
};
export const updateDonorProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = (req as any).user;
    const { mobileNumber, address, emergencyContactName, emergencyContactRelationship, emergencyContactNumber } = req.body;
    
    const donor = await prisma.donor.findUnique({ where: { userId }, include: { emergencyContact: true } });
    if (!donor) {
      res.status(404).json({ error: 'Donor not found' });
      return;
    }

    await prisma.donor.update({
      where: { id: donor.id },
      data: {
        mobileNumber,
        address,
        emergencyContact: {
          upsert: {
            create: {
              name: emergencyContactName,
              relationship: emergencyContactRelationship,
              mobileNumber: emergencyContactNumber
            },
            update: {
              name: emergencyContactName,
              relationship: emergencyContactRelationship,
              mobileNumber: emergencyContactNumber
            }
          }
        }
      }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

export const getDonorEligibility = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = (req as any).user;
    const donor = await prisma.donor.findUnique({ where: { userId } });
    if (!donor) {
      res.status(404).json({ error: 'Donor not found' });
      return;
    }
    
    let status = 'Eligible';
    let nextEligibleDate = new Date();
    
    if (donor.lastDonationDate) {
      const daysSinceLastDonation = Math.floor((new Date().getTime() - donor.lastDonationDate.getTime()) / (1000 * 3600 * 24));
      if (daysSinceLastDonation < 90) { // 90 days deferral
        status = 'Deferred';
        nextEligibleDate = new Date(donor.lastDonationDate.getTime() + 90 * 24 * 3600 * 1000);
      }
    }
    
    res.json({ status, nextEligibleDate });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch eligibility' });
  }
};

export const submitFeedback = async (req: Request, res: Response): Promise<void> => {
  res.json({ success: true, message: 'Feedback received' });
};
