import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testBooking() {
  const donor = await prisma.donor.findFirst();
  if (!donor) throw new Error('No donor found');

  const bloodBank = await prisma.bloodBank.findFirst();
  if (!bloodBank) throw new Error('No blood bank found');

  console.log(`Booking for Donor: ${donor.id}, BloodBank: ${bloodBank.id}`);

  try {
    const appointment = await prisma.appointment.create({
      data: {
        donorId: donor.id,
        bloodBankId: bloodBank.id,
        donationSlotId: undefined,
        date: new Date('2026-08-19'),
        timeSlot: '09:00 AM',
        status: 'Scheduled'
      }
    });
    console.log('Successfully created appointment:', appointment.id);
  } catch (error) {
    console.error('Prisma Error:', error);
  }
}

testBooking().finally(() => prisma.$disconnect());
