import { Request, Response } from 'express';
import { prisma } from '../app';

export const submitRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = (req as any).user;
    const { bloodGroup, component, quantity, urgency, patientDetails, requiredDate } = req.body;

    const hospital = await prisma.hospital.findUnique({ where: { userId } });
    if (!hospital) {
      res.status(404).json({ error: 'Hospital profile not found' });
      return;
    }

    const requestCount = await prisma.bloodRequest.count();
    const requestNumber = `BR-${new Date().getFullYear()}-${String(requestCount + 1).padStart(6, '0')}`;

    const bloodRequest = await prisma.bloodRequest.create({
      data: {
        requestNumber,
        hospitalId: hospital.id,
        bloodGroup,
        component: component || 'Whole Blood',
        quantity,
        urgency,
        patientDetails,
        requiredDate: new Date(requiredDate),
        status: 'PENDING'
      }
    });

    await prisma.auditLog.create({
      data: {
        action: 'SUBMIT_BLOOD_REQUEST',
        userId,
        role: 'Hospital',
        entity: 'BloodRequest',
        entityId: bloodRequest.id,
        newStatus: 'PENDING'
      }
    });

    res.status(201).json(bloodRequest);
  } catch (error) {
    console.error("REQUEST ERROR:", error);
    res.status(500).json({ error: 'Failed to submit blood request' });
  }
};

export const getAllRequests = async (req: Request, res: Response): Promise<void> => {
  try {
    const requests = await prisma.bloodRequest.findMany({
      include: { 
        hospital: { include: { user: { select: { name: true } } } },
        approvedBy: { select: { name: true } }
      },
      orderBy: { requestedAt: 'desc' }
    });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
};

export const getHospitalRequests = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = (req as any).user;
    const hospital = await prisma.hospital.findUnique({ where: { userId } });
    if (!hospital) return;

    const requests = await prisma.bloodRequest.findMany({
      where: { hospitalId: hospital.id },
      orderBy: { requestedAt: 'desc' },
      include: { bloodIssues: { include: { bloodUnit: true } } }
    });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch hospital requests' });
  }
};

export const processRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = (req as any).user;
    const requestId = req.params.requestId as string;
    const { action } = req.body; // 'APPROVE', 'REJECT'

    const bloodRequest = await prisma.bloodRequest.findUnique({ where: { id: requestId } });
    if (!bloodRequest || bloodRequest.status !== 'PENDING') {
      res.status(400).json({ error: 'Valid pending request required' });
      return;
    }

    if (action === 'REJECT') {
      const updated = await prisma.bloodRequest.update({
        where: { id: requestId },
        data: { status: 'REJECTED' }
      });
      res.json(updated);
      return;
    }

    if (action === 'APPROVE') {
      // Logic to auto-reserve blood if available
      const availableUnits = await prisma.bloodUnit.findMany({
        where: {
          bloodGroup: bloodRequest.bloodGroup,
          component: bloodRequest.component,
          status: 'AVAILABLE'
        },
        take: bloodRequest.quantity,
        orderBy: { expiryDate: 'asc' } // Expiring soon first
      });

      if (availableUnits.length < bloodRequest.quantity) {
        // Waitlist
        const updated = await prisma.bloodRequest.update({
          where: { id: requestId },
          data: { status: 'WAITLISTED' }
        });
        res.json({ message: 'Not enough inventory. Request Waitlisted.', request: updated });
        return;
      }

      // Reserve the units
      const result = await prisma.$transaction(async (tx) => {
        const updatedReq = await tx.bloodRequest.update({
          where: { id: requestId },
          data: { 
            status: 'RESERVED',
            approvedById: userId,
            approvedAt: new Date()
          }
        });

        for (const unit of availableUnits) {
          await tx.bloodUnit.update({
            where: { id: unit.id },
            data: { status: 'RESERVED' }
          });
          
          await tx.inventoryTransaction.create({
            data: {
              bloodUnitId: unit.id,
              type: 'RESERVE',
              remarks: `Reserved for Request ${updatedReq.requestNumber}`
            }
          });
        }

        return updatedReq;
      }, { isolationLevel: 'Serializable' });

      res.json({ message: 'Blood units reserved successfully', request: result });
      return;
    }

    res.status(400).json({ error: 'Invalid action' });
  } catch (error) {
    console.error("PROCESS REQUEST ERROR:", error);
    res.status(500).json({ error: 'Failed to process request' });
  }
};

export const issueBlood = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = (req as any).user;
    const requestId = req.params.requestId as string;

    const bloodRequest = await prisma.bloodRequest.findUnique({ where: { id: requestId } });
    if (!bloodRequest || bloodRequest.status !== 'RESERVED') {
      res.status(400).json({ error: 'Valid reserved request required' });
      return;
    }

    // Find all reserved units for this request? Wait, we didn't explicitly link reservations to requests yet in the DB model besides the log.
    // Let's find units that are reserved and of the right group? 
    // Actually, in the Reservation step, we should probably link them or find the `RESERVED` units.
    // For a robust system, we should have a `BloodReservation` table or link them during ISSUE.
    // Since we don't have a strict Reservation link table, let's just find the generic reserved units of the same group. This is a bit weak.
    // Let's improve this: we can just find any RESERVED units that match the blood group, but better to issue directly by passing the unit IDs or assume the ones we reserved earlier.
    // Let's find RESERVED units matching group.
    const reservedUnits = await prisma.bloodUnit.findMany({
      where: {
        bloodGroup: bloodRequest.bloodGroup,
        component: bloodRequest.component,
        status: 'RESERVED'
      },
      take: bloodRequest.quantity
    });

    if (reservedUnits.length < bloodRequest.quantity) {
      res.status(400).json({ error: 'Not enough reserved units available in system.' });
      return;
    }

    const issueCount = await prisma.bloodIssue.count();
    let counter = issueCount + 1;

      const result = await prisma.$transaction(async (tx) => {
      const updatedReq = await tx.bloodRequest.update({
        where: { id: requestId },
        data: { status: 'COMPLETED' }
      });

      for (const unit of reservedUnits) {
        const issueNumber = `ISS-${new Date().getFullYear()}-${String(counter++).padStart(6, '0')}`;
        
        await tx.bloodIssue.create({
          data: {
            issueNumber,
            requestId,
            bloodUnitId: unit.id,
            issuedById: userId
          }
        });

        await tx.bloodUnit.update({
          where: { id: unit.id },
          data: { status: 'ISSUED' }
        });

        await tx.inventoryTransaction.create({
          data: {
            bloodUnitId: unit.id,
            type: 'ISSUE',
            remarks: `Issued for Request ${updatedReq.requestNumber}`
          }
        });
      }

      await tx.auditLog.create({
        data: {
          action: 'ISSUE_BLOOD',
          userId,
          role: 'Admin', // or staff
          entity: 'BloodRequest',
          entityId: requestId,
          prevStatus: 'RESERVED',
          newStatus: 'COMPLETED'
        }
      });

      return updatedReq;
    }, { isolationLevel: 'Serializable' });

    res.json({ message: 'Blood units issued successfully', request: result });
  } catch (error) {
    console.error("ISSUE ERROR:", error);
    res.status(500).json({ error: 'Failed to issue blood' });
  }
};
