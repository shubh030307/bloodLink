import { Request, Response } from 'express';
import { prisma } from '../server';
import crypto from 'crypto';

export const bookAppointment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = (req as any).user;
    const { bloodBankId, date, timeSlot, donationSlotId } = req.body;
    
    const donor = await prisma.donor.findUnique({ where: { userId } });
    if (!donor) {
      res.status(404).json({ error: 'Donor not found' });
      return;
    }

    // Find or create slot dynamically if it's a dummy or missing
    let slot = await prisma.donationSlot.findFirst({
      where: { bloodBankId, date: new Date(date), timeSlot },
      include: { appointments: true }
    });

    if (!slot) {
      slot = await prisma.donationSlot.create({
        data: {
          bloodBankId,
          date: new Date(date),
          timeSlot,
          capacity: 10 // Default capacity for dynamically created slots
        },
        include: { appointments: true }
      });
    }

    if (slot.appointments && slot.appointments.length >= slot.capacity) {
      res.status(400).json({ error: 'Slot is full' });
      return;
    }
    
    // override the donationSlotId with the real one
    const realDonationSlotId = slot.id;
    
    const count = await prisma.appointment.count();
    const appointmentNumber = `APT-${new Date().getFullYear()}-${String(count + 1).padStart(6, '0')}`;

    // Generate secure opaque QR token (e.g., APT-TOKEN-8F92XK)
    const qrToken = `APT-TOKEN-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const qrExpiresAt = new Date(new Date(date).getTime() + 5 * 60 * 60 * 1000); // Expires 5 hours after appointment start date/time (configurable via settings but hardcoded for now)

    const appointment = await prisma.appointment.create({
      data: {
        appointmentNumber,
        donorId: donor.id,
        bloodBankId,
        donationSlotId: realDonationSlotId,
        date: new Date(date),
        timeSlot,
        status: 'BOOKED',
        qrToken,
        qrExpiresAt
      }
    });

    res.status(201).json(appointment);
  } catch (error) {
    console.error("BOOKING ERROR:", error);
    res.status(500).json({ error: 'Failed to book appointment' });
  }
};

export const staffBookAppointment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { donorId, bloodBankId, date, timeSlot } = req.body;
    
    const donor = await prisma.donor.findUnique({ where: { id: donorId } });
    if (!donor) {
      res.status(404).json({ error: 'Donor not found' });
      return;
    }

    // Find or create slot dynamically if missing
    let slot = await prisma.donationSlot.findFirst({
      where: { bloodBankId, date: new Date(date), timeSlot },
      include: { appointments: true }
    });

    if (!slot) {
      slot = await prisma.donationSlot.create({
        data: {
          bloodBankId,
          date: new Date(date),
          timeSlot,
          capacity: 10 // Default capacity for dynamically created slots
        },
        include: { appointments: true }
      });
    }

    if (slot.appointments && slot.appointments.length >= slot.capacity) {
      res.status(400).json({ error: 'Slot is full' });
      return;
    }
    
    const realDonationSlotId = slot.id;
    
    const count = await prisma.appointment.count();
    const appointmentNumber = `APT-${new Date().getFullYear()}-${String(count + 1).padStart(6, '0')}`;

    const qrToken = `APT-TOKEN-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const qrExpiresAt = new Date(new Date(date).getTime() + 5 * 60 * 60 * 1000); 

    const appointment = await prisma.appointment.create({
      data: {
        appointmentNumber,
        donorId: donor.id,
        bloodBankId,
        donationSlotId: realDonationSlotId,
        date: new Date(date),
        timeSlot,
        status: 'BOOKED',
        qrToken,
        qrExpiresAt
      }
    });

    res.status(201).json(appointment);
  } catch (error) {
    console.error("STAFF BOOKING ERROR:", error);
    res.status(500).json({ error: 'Failed to book appointment' });
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
    const { centerId, date } = req.query;
    if (!centerId || !date) {
      res.status(400).json({ error: 'Center ID and date are required' });
      return;
    }

    const startOfDay = new Date(date as string);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const slots = await prisma.donationSlot.findMany({
      where: {
        bloodBankId: centerId as string,
        date: {
          gte: startOfDay,
          lt: endOfDay
        }
      },
      include: {
        _count: {
          select: { appointments: true }
        }
      }
    });

    const availableSlots = slots.map(slot => ({
      ...slot,
      availableCapacity: slot.capacity - slot._count.appointments
    }));

    res.json(availableSlots);
  } catch (error) {
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
        bloodBank: true
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
