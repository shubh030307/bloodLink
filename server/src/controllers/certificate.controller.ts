import { Request, Response } from 'express';
import { prisma } from '../app';


export const getMyCertificates = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = (req as any).user;
    const donor = await prisma.donor.findUnique({ where: { userId } });
    
    if (!donor) {
      res.status(404).json({ error: 'Donor not found' });
      return;
    }

    const certificates = await prisma.certificate.findMany({
      where: { donorId: donor.id },
      include: {
        donor: { include: { user: true } }
      },
      orderBy: { issuedAt: 'desc' }
    });

    res.json(certificates);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch certificates' });
  }
};

export const generateCertificate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = (req as any).user;
    const { donationId } = req.body;

    const donor = await prisma.donor.findUnique({ where: { userId }, include: { user: true } });
    if (!donor) return;

    const donation = await prisma.donation.findUnique({
      where: { id: donationId },
      include: { visit: { include: { appointment: true } } }
    });

    if (!donation || donation.visit.appointment.donorId !== donor.id) {
      res.status(400).json({ error: 'Valid donation required' });
      return;
    }

    if (donation.status !== 'OTP_VERIFIED') {
      res.status(400).json({ error: 'Donation not fully completed and verified.' });
      return;
    }

    // Check if already exists
    let certificate = await prisma.certificate.findFirst({ 
      where: { visitId: donation.visit.id, type: 'DONATION' },
      include: { donor: { include: { user: true } } }
    });

    if (!certificate) {
      const certificateNumber = `CERT-DON-${new Date().getFullYear()}-${globalThis.crypto.randomUUID().replace(/-/g, '').substring(0, 8).toUpperCase()}`;
      
      const { generateStandardCertificatePdf } = await import('../utils/certificateGenerator');
      const certificateUrl = await generateStandardCertificatePdf({
        certificateNumber,
        donorName: donor.user.name,
        bloodGroup: donor.bloodGroup,
        date: new Date()
      });

      certificate = await prisma.certificate.create({
        data: {
          certificateNumber,
          donorId: donor.id,
          visitId: donation.visit.id,
          type: 'DONATION',
          certificateUrl
        },
        include: { donor: { include: { user: true } } }
      });
    }

    res.json(certificate);
  } catch (error) {
    console.error("CERTIFICATE ERROR:", error);
    res.status(500).json({ error: 'Failed to generate certificate' });
  }
};

export const generateMilestoneCertificate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = (req as any).user;
    const { milestoneId } = req.body;
    
    const donor = await prisma.donor.findUnique({ where: { userId }, include: { user: true } });
    if (!donor) {
      res.status(404).json({ error: 'Donor not found' });
      return;
    }

    // Verify they actually unlocked this milestone
    const achievement = await prisma.donorMilestoneAchievement.findUnique({
      where: { donorId_milestoneId: { donorId: donor.id, milestoneId } },
      include: { milestone: true }
    });

    if (!achievement) {
      res.status(400).json({ error: 'Milestone not yet achieved.' });
      return;
    }

    // Check if certificate already exists
    let existing = await prisma.certificate.findFirst({
      where: { donorId: donor.id, milestoneId, type: 'MILESTONE' },
      include: { donor: { include: { user: true } } }
    });

    if (!existing) {
      const certNumber = `CERT-MIL-${globalThis.crypto.randomUUID().replace(/-/g, '').substring(0, 8).toUpperCase()}`;
      
      const { generateMilestoneCertificatePdf } = await import('../utils/certificateGenerator');
      const certificateUrl = await generateMilestoneCertificatePdf({
        certificateNumber: certNumber,
        donorName: donor.user.name,
        milestoneName: achievement.milestone.name,
        donationCount: achievement.donationCountAtUnlock,
        date: new Date()
      });

      existing = await prisma.certificate.create({
        data: {
          certificateNumber: certNumber,
          donorId: donor.id,
          milestoneId,
          type: 'MILESTONE',
          certificateUrl
        },
        include: { donor: { include: { user: true } } }
      });
    }

    res.json({
      certificate: existing,
      milestone: achievement.milestone,
      donationCount: achievement.donationCountAtUnlock
    });
  } catch (error) {
    console.error("MILESTONE CERTIFICATE ERROR:", error);
    res.status(500).json({ error: 'Failed to generate milestone certificate' });
  }
};
