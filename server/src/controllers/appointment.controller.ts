import { Request, Response } from 'express';
import { prisma } from '../app';

import { generateIdentifier, generateQrToken } from '../utils/securityUtils';

export const bookAppointment = async (req: Request, res: Response): Promise<any> => {
  try {
    const { userId } = (req as any).user;
    const { donationSlotId } = req.body;
    
    if (!donationSlotId) {
      res.status(400).json({ success: false, code: 'MISSING_SLOT', message: 'donationSlotId is required' });
      return;
    }

    const donor = await prisma.donor.findUnique({ where: { userId } });
    if (!donor) {
      res.status(404).json({ success: false, code: 'DONOR_NOT_FOUND', message: 'Donor not found' });
      return;
    }

    // STRICT Booking via Serializable Transaction
    const appointment = await prisma.$transaction(async (tx) => {
      // 1. Fetch the slot and lock it for update (we count appointments later but need to ensure it's valid)
      const slot = await tx.donationSlot.findUnique({
        where: { id: donationSlotId },
        include: {
          _count: { select: { appointments: true } },
          camp: true,
          bloodBank: true
        }
      });

      if (!slot) throw new Error('SLOT_NOT_FOUND');
      
      // Verify camp status if applicable
      if (slot.camp && slot.camp.status !== 'OPEN') {
        throw new Error('CAMP_NOT_OPEN');
      }

      // 2. Capacity Check
      if (slot._count.appointments >= slot.capacity) {
        throw new Error('SLOT_FULL');
      }

      // 3. Bank Daily Limit (Max 30)
      if (slot.bloodBankId) {
        // Count total appointments for this bank on this specific date
        const startOfDay = new Date(slot.date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(startOfDay);
        endOfDay.setDate(endOfDay.getDate() + 1);

        const dailyCount = await tx.appointment.count({
          where: {
            bloodBankId: slot.bloodBankId,
            date: { gte: startOfDay, lt: endOfDay },
            status: { notIn: ['CANCELLED', 'EXPIRED'] }
          }
        });

        if (dailyCount >= 30) throw new Error('BANK_LIMIT_REACHED');
      }

      // 4. Duplicate Donor Booking Prevention
      const existing = await tx.appointment.findFirst({
        where: {
          donorId: donor.id,
          date: slot.date,
          status: { notIn: ['CANCELLED', 'EXPIRED'] }
        }
      });
      if (existing) throw new Error('DUPLICATE_BOOKING');

      const count = await tx.appointment.count();
      const appointmentNumber = generateIdentifier('APT', count);
      const qrToken = generateQrToken('APT-TOKEN', 4);
      const qrExpiresAt = new Date(slot.startTime.getTime() + 5 * 60 * 60 * 1000); 

      // 5. Create Appointment
      return await tx.appointment.create({
        data: {
          appointmentNumber,
          donorId: donor.id,
          bloodBankId: slot.bloodBankId,
          campId: slot.campId,
          donationSlotId: slot.id,
          date: slot.date,
          status: 'BOOKED',
          qrToken,
          qrExpiresAt
        }
      });
    }, { isolationLevel: 'Serializable' });

    res.status(201).json({ success: true, appointment });
  } catch (error: any) {
    console.error("BOOKING ERROR:", error);
    
    if (error.message === 'SLOT_NOT_FOUND') return res.status(404).json({ success: false, code: 'SLOT_NOT_FOUND', message: 'Slot not found' });
    if (error.message === 'CAMP_NOT_OPEN') return res.status(400).json({ success: false, code: 'CAMP_NOT_OPEN', message: 'Camp is not open for booking' });
    if (error.message === 'SLOT_FULL') return res.status(409).json({ success: false, code: 'SLOT_FULL', message: 'This slot is already full' });
    if (error.message === 'DUPLICATE_BOOKING') return res.status(409).json({ success: false, code: 'DUPLICATE_BOOKING', message: 'You already have an active booking for this date.' });
    if (error.message === 'BANK_LIMIT_REACHED') return res.status(409).json({ success: false, code: 'BANK_LIMIT_REACHED', message: 'The blood bank has reached its maximum daily capacity of 30 bookings.' });

    res.status(500).json({ success: false, message: 'Failed to book appointment' });
  }
};

export const staffBookAppointment = async (req: Request, res: Response): Promise<any> => {
  try {
    const { donorId, donationSlotId } = req.body;
    
    if (!donationSlotId) {
      res.status(400).json({ success: false, code: 'MISSING_SLOT', message: 'donationSlotId is required' });
      return;
    }

    const donor = await prisma.donor.findUnique({ where: { id: donorId } });
    if (!donor) {
      res.status(404).json({ success: false, code: 'DONOR_NOT_FOUND', message: 'Donor not found' });
      return;
    }

    // STRICT Booking via Serializable Transaction
    const appointment = await prisma.$transaction(async (tx) => {
      const slot = await tx.donationSlot.findUnique({
        where: { id: donationSlotId },
        include: {
          _count: { select: { appointments: true } },
          camp: true,
          bloodBank: true
        }
      });

      if (!slot) throw new Error('SLOT_NOT_FOUND');
      
      if (slot.camp && slot.camp.status !== 'OPEN') {
        throw new Error('CAMP_NOT_OPEN');
      }

      if (slot._count.appointments >= slot.capacity) {
        throw new Error('SLOT_FULL');
      }

      if (slot.bloodBankId) {
        const startOfDay = new Date(slot.date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(startOfDay);
        endOfDay.setDate(endOfDay.getDate() + 1);

        const dailyCount = await tx.appointment.count({
          where: {
            bloodBankId: slot.bloodBankId,
            date: { gte: startOfDay, lt: endOfDay },
            status: { notIn: ['CANCELLED', 'EXPIRED'] }
          }
        });

        if (dailyCount >= 30) throw new Error('BANK_LIMIT_REACHED');
      }

      const existing = await tx.appointment.findFirst({
        where: {
          donorId: donor.id,
          date: slot.date,
          status: { notIn: ['CANCELLED', 'EXPIRED'] }
        }
      });
      if (existing) throw new Error('DUPLICATE_BOOKING');

      const count = await tx.appointment.count();
      const appointmentNumber = generateIdentifier('APT', count);
      const qrToken = generateQrToken('APT-TOKEN', 4);
      const qrExpiresAt = new Date(slot.startTime.getTime() + 5 * 60 * 60 * 1000); 

      return await tx.appointment.create({
        data: {
          appointmentNumber,
          donorId: donor.id,
          bloodBankId: slot.bloodBankId,
          campId: slot.campId,
          donationSlotId: slot.id,
          date: slot.date,
          status: 'BOOKED',
          qrToken,
          qrExpiresAt
        }
      });
    }, { isolationLevel: 'Serializable' });

    res.status(201).json({ success: true, appointment });
  } catch (error: any) {
    console.error("STAFF BOOKING ERROR:", error);
    
    if (error.message === 'SLOT_NOT_FOUND') return res.status(404).json({ success: false, code: 'SLOT_NOT_FOUND', message: 'Slot not found' });
    if (error.message === 'CAMP_NOT_OPEN') return res.status(400).json({ success: false, code: 'CAMP_NOT_OPEN', message: 'Camp is not open for booking' });
    if (error.message === 'SLOT_FULL') return res.status(409).json({ success: false, code: 'SLOT_FULL', message: 'This slot is already full' });
    if (error.message === 'DUPLICATE_BOOKING') return res.status(409).json({ success: false, code: 'DUPLICATE_BOOKING', message: 'Donor already has an active booking for this date.' });
    if (error.message === 'BANK_LIMIT_REACHED') return res.status(409).json({ success: false, code: 'BANK_LIMIT_REACHED', message: 'The blood bank has reached its maximum daily capacity of 30 bookings.' });

    res.status(500).json({ success: false, message: 'Failed to book appointment' });
  }
};

export const getMyAppointments = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = (req as any).user;
    const donor = await prisma.donor.findUnique({ where: { userId } });
    if (!donor) {
      res.status(404).json({ error: 'Donor not found' });
      return;
    }

    const appointments = await prisma.appointment.findMany({
      where: { donorId: donor.id },
      include: {
        bloodBank: true,
        camp: true,
        donationSlot: true,
        visit: {
          include: {
            donation: {
              include: {
                otpVerification: true
              }
            }
          }
        }
      },
      orderBy: [
        { date: 'desc' },
        { appointmentNumber: 'desc' }
      ]
    });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
};

export const cancelAppointment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = (req as any).user;
    const appointmentId = req.params.id as string;

    const donor = await prisma.donor.findUnique({ where: { userId } });
    if (!donor) return;

    const appointment = await prisma.appointment.findUnique({ where: { id: appointmentId } });
    if (!appointment || appointment.donorId !== donor.id) {
      res.status(404).json({ error: 'Appointment not found' });
      return;
    }

    if (appointment.status !== 'BOOKED') {
      res.status(400).json({ error: 'Only booked appointments can be cancelled' });
      return;
    }

    await prisma.appointment.update({
      where: { id: appointmentId },
      data: { 
        status: 'CANCELLED',
        qrToken: null, // Invalidate QR on cancel
        qrExpiresAt: null
      }
    });
    res.json({ message: 'Appointment cancelled' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to cancel appointment' });
  }
};

export const getAvailableSlots = async (req: Request, res: Response): Promise<void> => {
  try {
    const { centerId, campId, date } = req.query;
    
    let where: any = {};
    if (campId) {
      where = { campId: campId as string };
    } else if (centerId && date) {
      const startOfDay = new Date(date as string);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(startOfDay);
      endOfDay.setDate(endOfDay.getDate() + 1);
      where = {
        bloodBankId: centerId as string,
        date: { gte: startOfDay, lt: endOfDay }
      };
    } else {
      res.status(400).json({ error: 'Provide either campId, or both centerId and date' });
      return;
    }

    const slots = await prisma.donationSlot.findMany({
      where,
      include: {
        _count: {
          select: { appointments: { where: { status: { notIn: ['CANCELLED', 'EXPIRED'] } } } }
        }
      },
      orderBy: { startTime: 'asc' }
    });

    const availableSlots = slots.map(slot => ({
      ...slot,
      availableCapacity: slot.capacity - slot._count.appointments
    }));

    res.json(availableSlots);
  } catch (error) {
    console.error("GET SLOTS ERROR", error);
    res.status(500).json({ error: 'Failed to fetch slots' });
  }
};

export const getAllBloodBanks = async (req: Request, res: Response): Promise<void> => {
  try {
    const bloodBanks = await prisma.bloodBank.findMany();
    res.json(bloodBanks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch blood banks' });
  }
};

export const getAllAppointments = async (req: Request, res: Response): Promise<void> => {
  try {
    const appointments = await prisma.appointment.findMany({
      include: {
        donor: { include: { user: true } },
        bloodBank: true,
        camp: true,
        donationSlot: true,
        visit: {
          include: {
            donation: {
              include: {
                otpVerification: true
              }
            }
          }
        }
      },
      orderBy: { date: 'desc' }
    });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
};
export const getAppointmentQr = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = (req as any).user;
    const appointmentId = req.params.id as string;

    const donor = await prisma.donor.findUnique({ where: { userId } });
    if (!donor) {
      res.status(404).json({ error: 'Donor not found' });
      return;
    }

    const appointment = await prisma.appointment.findUnique({ where: { id: appointmentId } });
    if (!appointment || appointment.donorId !== donor.id) {
      res.status(404).json({ error: 'Appointment not found' });
      return;
    }

    if (appointment.status !== 'BOOKED') {
      res.status(400).json({ error: 'Appointment is not in BOOKED state' });
      return;
    }

    // Optional 3-hour buffer logic (commented out for easy testing, or keep it if strictly needed)
    // const now = new Date();
    // const apptDate = new Date(appointment.date);
    // const [hours, minutes] = appointment.timeSlot.split(/[: ]/); 
    // ... calculate time
    // For now, let's just return the token so the user can test the QR code immediately.

    res.json({ token: appointment.qrToken });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch QR token' });
  }
};
