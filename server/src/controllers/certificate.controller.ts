import { Request, Response } from 'express';
import { prisma } from '../server';
import crypto from 'crypto';

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

    const donor = await prisma.donor.findUnique({ where: { userId } });
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
      // Actually we should let them generate it if they've successfully donated.
      // The blood unit could be TESTING, AVAILABLE, or DISCARDED. But they still donated.
    }

    // Check if already exists
    let certificate = await prisma.certificate.findFirst({ where: { visitId: donation.visit.id } });

    if (!certificate) {
      const certificateNumber = `CERT-${new Date().getFullYear()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
      
      certificate = await prisma.certificate.create({
        data: {
          certificateNumber,
          donorId: donor.id,
          visitId: donation.visit.id,
          certificateUrl: 'mock-url-for-now'
        }
      });
    }

    res.json(certificate);
  } catch (error) {
    console.error("CERTIFICATE ERROR:", error);
    res.status(500).json({ error: 'Failed to generate certificate' });
  }
};
