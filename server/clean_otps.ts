import { PrismaClient } from '@prisma/client'; 
const prisma = new PrismaClient(); 

async function main() { 
  await prisma.otpVerification.deleteMany({}); 
  await prisma.donation.updateMany({
    where: { status: 'OTP_PENDING' },
    data: { status: 'COLLECTION_PENDING' }
  });
  console.log('Deleted old OTPs and reset pending donations to COLLECTION_PENDING'); 
} 

main().finally(() => prisma.$disconnect());
