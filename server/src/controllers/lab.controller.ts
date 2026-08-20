import { Request, Response } from 'express';
import { prisma } from '../app';
import { AuthRequest } from '../middlewares/auth.middleware';
import { generateLabReportPdf } from '../utils/pdfGenerator';

// Helper to log audit events
const logAudit = async (action: string, userId: string, role: string, entity: string, entityId: string, prevStatus?: string, newStatus?: string, details?: string) => {
  await prisma.auditLog.create({
    data: { action, userId, role, entity, entityId, prevStatus, newStatus, details }
  });
};

export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    const stats = {
      pendingTesting: await prisma.bloodUnit.count({ where: { status: 'TESTING' } }),
      inProgress: await prisma.bloodUnit.count({ where: { status: 'TESTING_IN_PROGRESS' } }),
      pendingReview: await prisma.bloodUnit.count({ where: { status: 'REPORT_REVIEW' } }),
      approvedToday: await prisma.bloodUnit.count({
        where: {
          status: { in: ['APPROVED', 'INVENTORY_PENDING', 'AVAILABLE'] },
          labReport: { generatedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } }
        }
      }),
      rejectedToday: await prisma.bloodUnit.count({
        where: {
          status: { in: ['REJECTED', 'AWAITING_DISPOSAL', 'DISCARDED'] },
          labReport: { generatedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } }
        }
      }),
      sentToInventory: await prisma.bloodUnit.count({ where: { status: 'AVAILABLE' } }),
      exceptions: await prisma.labException.count({ where: { status: 'OPEN' } })
    };

    res.json(stats);
  } catch (error: any) {
    console.error('Error fetching lab dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch lab dashboard stats' });
  }
};

export const getQueue = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const queue = await prisma.bloodUnit.findMany({
      where: { status: 'TESTING' },
      include: {
        donation: {
          include: { visit: { include: { appointment: { include: { donor: { include: { user: true } } } } } } }
        },
        collectionCenter: true
      },
      orderBy: { donation: { collectionDate: 'asc' } }
    });
    res.json(queue);
  } catch (error: any) {
    console.error('Error fetching lab queue:', error);
    res.status(500).json({ error: 'Failed to fetch lab queue' });
  }
};

export const scanBloodBag = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { stickerId: rawStickerId } = req.body;
    const stickerId = rawStickerId.split('-MAIN')[0].split('-LAB-')[0];
    const userId = req.user?.userId || 'SYSTEM';

    const label = await prisma.bloodBagLabel.findUnique({
      where: { stickerId }
    });

    if (!label) {
      res.status(404).json({ error: 'Blood bag identifier not found.' });
      return;
    }

    if (label.status !== 'USED') {
      res.status(400).json({ error: 'This sticker is not associated with a completed Blood Unit collection.' });
      return;
    }

    const bloodUnit = await prisma.bloodUnit.findFirst({
      where: { bloodBagLabelId: label.id },
      include: {
        donation: { include: { otpVerification: true, visit: { include: { appointment: true } } } },
        collectionCenter: true
      }
    });

    if (!bloodUnit) {
      res.status(404).json({ error: 'No Blood Unit is associated with this sticker.' });
      return;
    }

    if (bloodUnit.status !== 'TESTING') {
      res.status(400).json({ error: `This Blood Unit is not currently available for laboratory testing. Current status: ${bloodUnit.status}` });
      return;
    }

    if (bloodUnit.donation?.otpVerification?.status !== 'OTP_VERIFIED') {
      res.status(400).json({ error: 'The donor collection OTP has not been verified yet.' });
      return;
    }

    await logAudit('LAB_UNIT_SCANNED', userId, req.user?.role || 'SYSTEM', 'BloodUnit', bloodUnit.id);
    
    res.json({ message: 'Blood Unit verified successfully.', bloodUnit });
  } catch (error: any) {
    console.error('Error scanning blood bag:', error);
    res.status(500).json({ error: 'Failed to scan blood bag' });
  }
};

export const startTesting = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bloodUnitId } = req.body;
    const userId = req.user?.userId || 'SYSTEM';

    const bloodUnit = await prisma.bloodUnit.findUnique({
      where: { id: bloodUnitId },
      include: { label: true }
    });

    if (!bloodUnit || bloodUnit.status !== 'TESTING') {
      res.status(400).json({ error: 'Blood unit is not available for testing' });
      return;
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedUnit = await tx.bloodUnit.update({
        where: { id: bloodUnitId },
        data: { status: 'TESTING_IN_PROGRESS' }
      });

      const session = await tx.laboratorySession.create({
        data: {
          sessionId: `LAB-SESSION-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`,
          bloodUnitId: bloodUnit.id,
          stickerId: bloodUnit.label?.stickerId || 'UNKNOWN',
          technicianId: userId,
          centerId: bloodUnit.collectionCenterId,
          status: 'IN_PROGRESS'
        }
      });

      return { updatedUnit, session };
    });

    await logAudit('LAB_TESTING_STARTED', userId, req.user?.role || 'SYSTEM', 'BloodUnit', bloodUnitId, 'TESTING', 'TESTING_IN_PROGRESS');

    res.json({ message: 'Testing started successfully', session: result.session });
  } catch (error: any) {
    console.error('Error starting testing:', error);
    res.status(500).json({ error: 'Failed to start testing' });
  }
};

export const getConfiguredTests = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tests = await prisma.laboratoryTest.findMany({ where: { isActive: true } });
    res.json(tests);
  } catch (error: any) {
    console.error('Error fetching tests:', error);
    res.status(500).json({ error: 'Failed to fetch laboratory tests configuration' });
  }
};

export const getSessionResults = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sessionId = req.params.sessionId as string;
    const results = await prisma.laboratoryTestResult.findMany({ where: { labSessionId: sessionId } });
    res.json(results);
  } catch (error: any) {
    console.error('Error fetching results:', error);
    res.status(500).json({ error: 'Failed to fetch results' });
  }
};

export const saveTestResults = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { sessionId, results } = req.body;
    const userId = req.user?.userId || 'SYSTEM';

    const session = await prisma.laboratorySession.findUnique({
      where: { id: sessionId },
      include: { bloodUnit: true }
    });

    if (!session || session.status !== 'IN_PROGRESS') {
      res.status(400).json({ error: 'Session is not in progress or not found' });
      return;
    }

    const savedResults = await prisma.$transaction(async (tx) => {
      // Clear existing draft results for this session to replace
      await tx.laboratoryTestResult.deleteMany({ where: { labSessionId: sessionId } });

      const created = [];
      for (const r of results) {
        const tr = await tx.laboratoryTestResult.create({
          data: {
            labSessionId: sessionId,
            bloodUnitId: session.bloodUnitId,
            testId: r.testId,
            resultValue: r.resultValue,
            resultStatus: r.resultStatus || 'NORMAL',
            remarks: r.remarks,
            performedById: userId
          }
        });
        created.push(tr);
      }
      return created;
    });

    res.json({ message: 'Results saved successfully', results: savedResults });
  } catch (error: any) {
    console.error('Error saving results:', error);
    res.status(500).json({ error: 'Failed to save test results' });
  }
};

export const completeTesting = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.body;
    const userId = req.user?.userId || 'SYSTEM';

    const session = await prisma.laboratorySession.findUnique({
      where: { id: sessionId },
      include: { results: true, bloodUnit: true }
    });

    if (!session || session.status !== 'IN_PROGRESS') {
      res.status(400).json({ error: 'Invalid session state' });
      return;
    }

    const requiredTests = await prisma.laboratoryTest.findMany({ where: { isActive: true, isRequired: true } });
    const missingTests = requiredTests.filter(rt => !session.results.some(r => r.testId === rt.id));

    if (missingTests.length > 0) {
      res.status(400).json({ error: `Missing required tests: ${missingTests.map(t => t.testName).join(', ')}` });
      return;
    }

    await prisma.$transaction(async (tx) => {
      await tx.laboratorySession.update({
        where: { id: sessionId },
        data: { status: 'COMPLETED', completedAt: new Date() }
      });

      await tx.bloodUnit.update({
        where: { id: session.bloodUnitId },
        data: { status: 'TESTING_COMPLETED' }
      });
    });

    await logAudit('LAB_TESTING_COMPLETED', userId, req.user?.role || 'SYSTEM', 'BloodUnit', session.bloodUnitId, 'TESTING_IN_PROGRESS', 'TESTING_COMPLETED');

    res.json({ message: 'Testing completed successfully' });
  } catch (error: any) {
    console.error('Error completing testing:', error);
    res.status(500).json({ error: 'Failed to complete testing' });
  }
};

export const generateReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bloodUnitId } = req.body;
    const userId = req.user?.userId || 'SYSTEM';

    const bloodUnit = await prisma.bloodUnit.findUnique({
      where: { id: bloodUnitId },
      include: {
        collectionCenter: true,
        labSessions: {
          where: { status: 'COMPLETED' },
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: { results: { include: { test: true } }, technician: true }
        }
      }
    });

    if (!bloodUnit || bloodUnit.status !== 'TESTING_COMPLETED') {
      res.status(400).json({ error: 'Blood unit is not ready for report generation' });
      return;
    }

    const session = bloodUnit.labSessions[0];

    const report = await prisma.$transaction(async (tx) => {
      const rep = await tx.labReport.create({
        data: {
          reportNumber: `LR-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
          bloodUnitId,
          labSessionId: session.id,
          technicianId: userId,
          testResults: JSON.parse(JSON.stringify(session.results)), // Snapshot
          decision: 'PENDING',
          status: 'DRAFT'
        }
      });

      await tx.bloodUnit.update({
        where: { id: bloodUnitId },
        data: { status: 'REPORT_REVIEW' }
      });

      return rep;
    });

    const pdfPath = await generateLabReportPdf({
      reportNumber: report.reportNumber,
      bloodUnitId: bloodUnit.id,
      stickerId: session.stickerId,
      centerName: bloodUnit.collectionCenter.name,
      technicianName: session.technician.name,
      results: session.results,
      decision: 'PENDING'
    });

    const finalReport = await prisma.labReport.update({
      where: { id: report.id },
      data: { documentStoragePath: pdfPath }
    });

    await logAudit('LAB_REPORT_GENERATED', userId, req.user?.role || 'SYSTEM', 'LabReport', report.id, 'TESTING_COMPLETED', 'REPORT_REVIEW');

    res.json({ message: 'Report generated', report: finalReport });
  } catch (error: any) {
    console.error('Error generating report:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
};

export const approveUnit = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bloodUnitId, reportId } = req.body;
    const userId = req.user?.userId || 'SYSTEM';

    const bloodUnit = await prisma.bloodUnit.findUnique({
      where: { id: bloodUnitId },
      include: { collectionCenter: true }
    });

    if (!bloodUnit || bloodUnit.status !== 'REPORT_REVIEW') {
      res.status(400).json({ error: 'Invalid blood unit status for approval' });
      return;
    }

    // ATOMIC APPROVAL AND INVENTORY HANDOFF
    await prisma.$transaction(async (tx) => {
      // 1. Lock report
      await tx.labReport.update({
        where: { id: reportId },
        data: { decision: 'APPROVED', status: 'FINALIZED', verifiedById: userId, verifiedAt: new Date() }
      });

      // 2. Set blood unit status
      await tx.bloodUnit.update({
        where: { id: bloodUnitId },
        data: { status: 'AVAILABLE' } // Skip INVENTORY_PENDING for this implementation to make it instantly usable
      });

      // 3. Create inventory transaction
      await tx.inventoryTransaction.create({
        data: {
          bloodUnitId,
          type: 'ADD',
          remarks: 'Approved by Lab Technician'
        }
      });
    });

    await logAudit('LAB_UNIT_APPROVED', userId, req.user?.role || 'SYSTEM', 'BloodUnit', bloodUnitId, 'REPORT_REVIEW', 'AVAILABLE');

    res.json({ message: 'Blood unit approved and added to inventory' });
  } catch (error: any) {
    console.error('Error approving unit:', error);
    res.status(500).json({ error: 'Failed to approve unit' });
  }
};

export const rejectUnit = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bloodUnitId, reportId, category, internalReason, donorFacingReason } = req.body;
    const userId = req.user?.userId || 'SYSTEM';

    const bloodUnit = await prisma.bloodUnit.findUnique({ where: { id: bloodUnitId } });

    if (!bloodUnit || bloodUnit.status !== 'REPORT_REVIEW') {
      res.status(400).json({ error: 'Invalid blood unit status for rejection' });
      return;
    }

    await prisma.$transaction(async (tx) => {
      await tx.labReport.update({
        where: { id: reportId },
        data: {
          decision: 'REJECTED',
          status: 'FINALIZED',
          internalReason: `[${category}] ${internalReason}`,
          donorFacingReason,
          verifiedById: userId,
          verifiedAt: new Date()
        }
      });

      await tx.bloodUnit.update({
        where: { id: bloodUnitId },
        data: { status: 'AWAITING_DISPOSAL' } // Immediately queued for disposal
      });
    });

    await logAudit('LAB_UNIT_REJECTED', userId, req.user?.role || 'SYSTEM', 'BloodUnit', bloodUnitId, 'REPORT_REVIEW', 'AWAITING_DISPOSAL');

    res.json({ message: 'Blood unit rejected and queued for disposal' });
  } catch (error: any) {
    console.error('Error rejecting unit:', error);
    res.status(500).json({ error: 'Failed to reject unit' });
  }
};

export const getUnitDetails = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const unit = await prisma.bloodUnit.findUnique({
      where: { id },
      include: {
        collectionCenter: true,
        label: true,
        donation: {
          include: {
            otpVerification: true,
            visit: { include: { appointment: { include: { donor: { include: { user: true } } } } } }
          }
        },
        labSessions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: { results: true }
        },
        labReport: true
      }
    });

    if (!unit) {
      res.status(404).json({ error: 'Blood unit not found' });
      return;
    }

    res.json(unit);
  } catch (error: any) {
    console.error('Error fetching unit:', error);
    res.status(500).json({ error: 'Failed to fetch blood unit' });
  }
};

export const getLabHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const history = await prisma.labReport.findMany({
      where: { status: { in: ['FINALIZED', 'AMENDED'] } },
      include: {
        bloodUnit: { include: { collectionCenter: true } },
        technician: true,
        verifiedBy: true
      },
      orderBy: { generatedAt: 'desc' }
    });
    res.json(history);
  } catch (error: any) {
    console.error('Error fetching lab history:', error);
    res.status(500).json({ error: 'Failed to fetch lab history' });
  }
};

export const getLabExceptions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const exceptions = await prisma.labException.findMany({
      include: {
        createdBy: true,
        resolvedBy: true,
        bloodUnit: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(exceptions);
  } catch (error: any) {
    console.error('Error fetching lab exceptions:', error);
    res.status(500).json({ error: 'Failed to fetch lab exceptions' });
  }
};

export const createLabException = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bloodUnitId, stickerId, labSessionId, type, description } = req.body;
    const userId = req.user?.userId || 'SYSTEM';

    const exception = await prisma.labException.create({
      data: {
        exceptionId: `EXC-LAB-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        bloodUnitId,
        stickerId,
        labSessionId,
        type,
        description,
        createdById: userId,
        status: 'OPEN'
      }
    });

    await logAudit('LAB_EXCEPTION_CREATED', userId, req.user?.role || 'SYSTEM', 'LabException', exception.id);

    res.json({ message: 'Exception logged successfully', exception });
  } catch (error: any) {
    console.error('Error creating exception:', error);
    res.status(500).json({ error: 'Failed to create exception' });
  }
};
