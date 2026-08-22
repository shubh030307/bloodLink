import { Request, Response } from 'express';
import { prisma } from '../app';
import { generateOTP } from '../utils/securityUtils';

interface AuthRequest extends Request {
  user?: { userId: string; role: string };
}

const logAudit = async (
  action: string,
  userId: string,
  role: string,
  entity: string,
  entityId: string,
  prevStatus?: string,
  newStatus?: string,
  details?: any
) => {
  await prisma.auditLog.create({
    data: { action, userId, role, entity, entityId, prevStatus, newStatus, details }
  });
};

export const getCollectionQueue = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const visits = await prisma.visit.findMany({
      where: { 
        status: { in: ['WAITING_FOR_COLLECTION', 'CHECKED_IN'] } 
      },
      include: {
        appointment: {
          include: {
            donor: { include: { user: { select: { name: true } } } },
            bloodBank: true
          }
        },
        queue: true
      },
      orderBy: { queue: { createdAt: 'asc' } }
    });

    const queue = visits.map(v => ({
      visitId: v.id,
      visitNumber: v.visitNumber,
      donorName: v.appointment.donor.user.name,
      donorId: v.appointment.donor.donorNumber,
      bloodGroup: v.appointment.donor.bloodGroup,
      medicalStatus: 'MEDICALLY_CLEARED',
      checkInTime: v.queue?.createdAt || new Date(),
      center: v.appointment.bloodBank?.name || 'Unknown'
    }));

    res.json(queue);
  } catch (error) {
    console.error('Error fetching collection queue:', error);
    res.status(500).json({ error: 'Failed to fetch collection queue' });
  }
};

export const scanVisitQr = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { visitQrToken } = req.body;
    if (!visitQrToken) {
      res.status(400).json({ error: 'Visit QR token is required' });
      return;
    }

    const visit = await prisma.visit.findUnique({
      where: { visitQrToken },
      include: {
        appointment: {
          include: {
            donor: { include: { user: { select: { name: true } } } },
            bloodBank: true
          }
        }
      }
    });

    if (!visit) {
      res.status(404).json({ error: 'Invalid or expired Visit QR.' });
      return;
    }

    if (visit.status === 'COMPLETED' || visit.status === 'COLLECTION') {
      res.status(400).json({ error: 'This visit has already completed collection or is in progress.' });
      return;
    }

    if (visit.status !== 'WAITING_FOR_COLLECTION' && visit.status !== 'CHECKED_IN') {
      res.status(400).json({ error: `This donation is not currently ready for collection (Status: ${visit.status}).` });
      return;
    }

    await logAudit('COLLECTION_STAFF_SCANNED_VISIT_QR', req.user?.userId || 'SYSTEM', req.user?.role || 'SYSTEM', 'Visit', visit.id);

    res.json({
      message: 'Visit verified successfully',
      visit: {
        id: visit.id,
        visitNumber: visit.visitNumber,
        appointmentId: visit.appointment.appointmentNumber,
        donorId: visit.appointment.donor.donorNumber,
        donorName: visit.appointment.donor.user.name,
        bloodGroup: visit.appointment.donor.bloodGroup,
        centerId: visit.appointment.bloodBankId,
        centerName: visit.appointment.bloodBank?.name || 'Unknown',
        status: visit.status
      }
    });
  } catch (error) {
    console.error('Error scanning visit QR:', error);
    res.status(500).json({ error: 'Failed to scan visit QR' });
  }
};

export const startCollection = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { visitId } = req.body;
    const userId = req.user?.userId || 'SYSTEM';

    const visit = await prisma.visit.findUnique({
      where: { id: visitId },
      include: { appointment: true }
    });

    if (!visit || (visit.status !== 'WAITING_FOR_COLLECTION' && visit.status !== 'CHECKED_IN')) {
      res.status(400).json({ error: 'Visit is not valid or not ready for collection.' });
      return;
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedVisit = await tx.visit.update({
        where: { id: visitId },
        data: { status: 'COLLECTION' }
      });

      const donationNum = `DON-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

      const donation = await tx.donation.create({
        data: {
          donationNumber: donationNum,
          visitId: visitId,
          collectionStaffId: userId,
          collectionDate: new Date(),
          collectionStartTime: new Date(),
          status: 'COLLECTION_STARTED'
        }
      });

      const collectionRecord = await tx.collectionRecord.create({
        data: {
          collectionRecordId: `COL-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
          donationId: donation.id,
          visitId: visitId,
          collectionStaffId: userId,
          centerId: visit.appointment.bloodBankId as string,
          startTime: new Date(),
          collectionStatus: 'IN_PROGRESS'
        }
      });

      await tx.auditLog.create({
        data: {
          action: 'COLLECTION_STARTED',
          userId: userId,
          role: req.user?.role || 'SYSTEM',
          entity: 'Donation',
          entityId: donation.id,
          prevStatus: visit.status,
          newStatus: 'COLLECTION'
        }
      });

      return { donation, collectionRecord, updatedVisit };
    });

    res.json({ message: 'Collection started successfully', result });
  } catch (error) {
    console.error('Error starting collection:', error);
    res.status(500).json({ error: 'Failed to start collection' });
  }
};

export const uploadCollectionForm = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { collectionRecordId, donorId, visitId, donationId, centerId } = req.body;
    const userId = req.user?.userId || 'SYSTEM';

    if (!req.file) {
      res.status(400).json({ error: 'No physical form document uploaded.' });
      return;
    }

    // Upload to Supabase Storage
    const uniqueSuffix = globalThis.crypto.randomUUID().replace(/-/g, '').substring(0, 16);
    const ext = req.file.originalname.split('.').pop();
    const filePath = `collection-${collectionRecordId}-${uniqueSuffix}.${ext}`;
    
    // Lazy load the supabase client to avoid top-level require issues
    const { uploadBufferToSupabase } = await import('../utils/supabaseClient');
    const documentUrl = await uploadBufferToSupabase('uploads', `forms/${filePath}`, req.file.buffer, req.file.mimetype);

    const form = await prisma.physicalCollectionForm.create({
      data: {
        documentUrl,
        collectionRecordId,
        donorId,
        visitId,
        donationId,
        centerId,
        uploadedById: userId,
      }
    });

    res.json({ message: 'Form uploaded successfully', form });
  } catch (error: any) {
    console.error('Error uploading collection form:', error);
    res.status(500).json({ error: error.message || 'Failed to upload collection form' });
  }
};

export const rejectCollection = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { donationId, rejectionReason, rejectionRemarks } = req.body;
    const userId = req.user?.userId || 'SYSTEM';

    const donation = await prisma.donation.findUnique({
      where: { id: donationId },
      include: { collectionRecord: true }
    });

    if (!donation || donation.status !== 'COLLECTION_STARTED') {
      res.status(400).json({ error: 'Invalid donation or not in progress.' });
      return;
    }

    const result = await prisma.$transaction(async (tx) => {
      await tx.collectionRecord.update({
        where: { id: donation.collectionRecord!.id },
        data: {
          collectionStatus: 'REJECTED',
          examinationResult: 'ABNORMAL',
          examinationReason: rejectionReason,
          examinationRemarks: rejectionRemarks,
          completionTime: new Date()
        }
      });

      const updatedDonation = await tx.donation.update({
        where: { id: donationId },
        data: {
          status: 'COLLECTION_REJECTED',
          collectionCompletionTime: new Date()
        }
      });

      const updatedVisit = await tx.visit.update({
        where: { id: donation.visitId },
        data: { status: 'COMPLETED' } 
      });

      await tx.otpVerification.updateMany({
        where: { donationId: donation.id, status: 'OTP_PENDING' },
        data: { status: 'OTP_FAILED' }
      });

      await tx.auditLog.create({
        data: { action: 'COLLECTION_REJECTED', userId, entity: 'Donation', entityId: donation.id }
      });

      return { updatedDonation, updatedVisit };
    });

    res.json({ message: 'Collection rejected successfully.', result });
  } catch (error: any) {
    console.error('Error rejecting collection:', error);
    res.status(500).json({ error: error.message || 'Failed to reject collection' });
  }
};

export const completeCollection = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { 
      donationId, 
      weight, 
      volume, 
      volumeOverrideReason, 
      examinationResult, 
      examinationReason, 
      examinationRemarks,
      collectionDetails, 
      remarks 
    } = req.body;
    const userId = req.user?.userId || 'SYSTEM';

    const donation = await prisma.donation.findUnique({
      where: { id: donationId },
      include: { 
        visit: { include: { appointment: { include: { donor: true } } } },
        collectionRecord: { include: { physicalForm: true } }
      }
    });

    if (!donation || donation.status !== 'COLLECTION_STARTED') {
      res.status(400).json({ error: 'Invalid donation or collection has not been started.' });
      return;
    }

    if (!donation.collectionRecord?.physicalForm) {
      res.status(400).json({ error: 'Physical collection form must be uploaded before completion.' });
      return;
    }

    if (!weight || !volume || !examinationResult) {
      res.status(400).json({ error: 'Weight, volume, and examination result are mandatory.' });
      return;
    }

    if (examinationResult === 'ABNORMAL') {
      res.status(400).json({ error: 'Cannot complete a normal collection with an abnormal examination. Use reject instead.' });
      return;
    }

    const result = await prisma.$transaction(async (tx) => {
      // Generate Sticker & Barcode natively
      const onDemandBatchNumber = `ON-DEMAND-PRINT-${donation.visit.appointment.bloodBankId}`;
      let onDemandBatch = await tx.bloodBagLabelBatch.findFirst({
        where: { centerId: donation.visit.appointment.bloodBankId as string, batchNumber: onDemandBatchNumber }
      });
      if (!onDemandBatch) {
        onDemandBatch = await tx.bloodBagLabelBatch.create({
          data: {
            batchNumber: onDemandBatchNumber,
            centerId: donation.visit.appointment.bloodBankId as string,
            prefix: 'STK',
            startNumber: 1,
            endNumber: 999999,
            quantity: 999999,
            status: 'ACTIVE',
            createdById: userId
          }
        });
      }

      const stickerIdStr = `STK-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

      const label = await tx.bloodBagLabel.create({
        data: {
          stickerId: stickerIdStr,
          batchId: onDemandBatch.id,
          centerId: donation.visit.appointment.bloodBankId as string,
          status: 'USED', 
          assignedAt: new Date(),
          assignedById: userId,
          usedAt: new Date()
        }
      });

      await tx.collectionRecord.update({
        where: { id: donation.collectionRecord!.id },
        data: {
          completionTime: new Date(),
          collectionStatus: 'COMPLETED',
          actualDonorWeight: parseFloat(weight),
          weightRecordedBy: userId,
          weightRecordedAt: new Date(),
          actualVolumeCollected: parseFloat(volume),
          volumeRecordedBy: userId,
          volumeRecordedAt: new Date(),
          volumeOverrideReason,
          examinationResult,
          examinationReason,
          examinationRemarks,
          collectionDetails,
          remarks
        }
      });

      const updatedDonation = await tx.donation.update({
        where: { id: donationId },
        data: {
          stickerId: label.id,
          collectionCompletionTime: new Date(),
          status: 'OTP_PENDING'
        }
      });

      const updatedVisit = await tx.visit.update({
        where: { id: donation.visitId },
        data: { status: 'COMPLETED' }
      });

      // Generate OTP right at the end of collection
      const rawOtp = generateOTP();
      await tx.otpVerification.create({
        data: {
          donationId: donation.id,
          otpHash: rawOtp,
          expiresAt: new Date(Date.now() + 60 * 60000)
        }
      });

      await tx.auditLog.create({
        data: { action: 'COLLECTION_COMPLETED', userId, entity: 'Donation', entityId: donation.id }
      });

      return { updatedDonation, updatedVisit, label, mockOtpSent: rawOtp };
    });

    res.json({ message: 'Collection completed successfully.', result });
  } catch (error: any) {
    console.error('Error completing collection:', error);
    res.status(500).json({ error: error.message || 'Failed to complete collection' });
  }
};

export const scanSticker = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { stickerId } = req.body;
    const label = await prisma.bloodBagLabel.findUnique({ where: { stickerId } });
    if (!label) { res.status(404).json({ error: 'Sticker not found.' }); return; }
    if (label.status !== 'AVAILABLE') { res.status(400).json({ error: 'Sticker is not available.' }); return; }
    res.json({ message: 'Sticker verified', label });
  } catch (error) {
    res.status(500).json({ error: 'Failed to verify sticker' });
  }
};

export const assignSticker = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { visitId, stickerId, donationId } = req.body;
    const userId = req.user?.userId || 'SYSTEM';
    const result = await prisma.$transaction(async (tx) => {
      const label = await tx.bloodBagLabel.findUnique({ where: { stickerId } });
      if (!label || label.status !== 'AVAILABLE') throw new Error('Sticker is not available');
      const updatedLabel = await tx.bloodBagLabel.update({
        where: { stickerId },
        data: { status: 'ASSIGNED', assignedAt: new Date(), assignedById: userId }
      });
      const updatedDonation = await tx.donation.update({ where: { id: donationId }, data: { stickerId: label.id } });
      return { updatedLabel, updatedDonation };
    });
    res.json({ message: 'Sticker assigned successfully', result });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to assign sticker' });
  }
};

export const verifyOtp = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { donationId, otp } = req.body;
    const userId = req.user?.userId || 'SYSTEM';

    const verification = await prisma.otpVerification.findUnique({ where: { donationId } });
    if (!verification || verification.status !== 'OTP_PENDING') {
      res.status(400).json({ error: 'No pending OTP verification found for this donation.' });
      return;
    }

    if (verification.attempts >= 3) {
      await prisma.otpVerification.update({ where: { donationId }, data: { status: 'OTP_FAILED' } });
      res.status(400).json({ error: 'OTP retry limit exceeded.' });
      return;
    }

    if (new Date() > verification.expiresAt) {
      await prisma.otpVerification.update({ where: { donationId }, data: { status: 'OTP_EXPIRED' } });
      res.status(400).json({ error: 'OTP has expired.' });
      return;
    }

    if (otp !== verification.otpHash) {
      await prisma.otpVerification.update({
        where: { donationId },
        data: { attempts: verification.attempts + 1 }
      });
      res.status(400).json({ error: 'Invalid OTP' });
      return;
    }

    const result = await prisma.$transaction(async (tx) => {
      await tx.otpVerification.update({
        where: { donationId },
        data: { status: 'OTP_VERIFIED', verifiedAt: new Date() }
      });

      const updatedDonation = await tx.donation.update({
        where: { id: donationId },
        data: { status: 'OTP_VERIFIED' },
        include: { visit: { include: { appointment: { include: { donor: true } } } } }
      });

      const buNumber = `BU-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

      const bloodUnit = await tx.bloodUnit.create({
        data: {
          unitNumber: buNumber,
          donationId: donationId,
          bloodBagLabelId: updatedDonation.stickerId,
          bloodGroup: updatedDonation.visit.appointment.donor.bloodGroup,
          collectionCenterId: updatedDonation.visit.appointment.bloodBankId as string,
          status: 'TESTING'
        }
      });

      await tx.auditLog.create({
        data: { action: 'OTP_VERIFIED', userId, entity: 'Donation', entityId: donationId }
      });
      await tx.auditLog.create({
        data: { action: 'BLOOD_UNIT_CREATED', userId, entity: 'BloodUnit', entityId: bloodUnit.id, newStatus: 'TESTING' }
      });

      return { bloodUnit };
    });

    res.json({ message: 'OTP verified successfully. Blood Unit sent to testing.', result });
  } catch (error: any) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
};
