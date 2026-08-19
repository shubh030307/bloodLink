import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  const appts = await prisma.appointment.findMany({
    include: { visit: { include: { donation: { include: { otpVerification: true } } } } },
    orderBy: { date: 'desc' },
    take: 5
  });
  console.log(JSON.stringify(appts.map(a => ({
    id: a.appointmentNumber,
    date: a.date,
    status: a.status,
    visit: a.visit ? { status: a.visit.status, don: a.visit.donation ? { status: a.visit.donation.status, otp: a.visit.donation.otpVerification } : null } : null
  })), null, 2));
}
run();
