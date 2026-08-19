import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function testApi() {
  const user = await prisma.user.findFirst({
    where: { role: { name: 'Donor' } },
    include: { donor: true }
  });

  if (!user) throw new Error('No donor user found');

  const hospital = await prisma.hospital.findFirst();
  if (!hospital) throw new Error('No hospital found');

  const bloodBank = await prisma.bloodBank.findFirst();
  if (!bloodBank) throw new Error('No blood bank found');

  const slot = await prisma.donationSlot.findFirst();
  if (!slot) throw new Error('No donation slot found');

  const token = jwt.sign({ userId: user.id, role: 'Donor' }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });

  try {
    const response = await fetch('http://localhost:5000/api/appointments/book', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        bloodBankId: bloodBank.id,
        date: '2026-08-19',
        timeSlot: '09:00 AM',
        donationSlotId: slot.id
      })
    });

    const data = await response.text();
    console.log('STATUS:', response.status);
    console.log('BODY:', data);
  } catch (error: any) {
    console.error('FETCH ERROR:', error);
  }
}

testApi().finally(() => prisma.$disconnect());
