import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkHospital() {
  const h = await prisma.hospital.findMany();
  console.log(h);
}

checkHospital().finally(() => prisma.$disconnect());
