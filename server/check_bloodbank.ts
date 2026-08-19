import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkBloodBank() {
  const bb = await prisma.bloodBank.findMany();
  console.log(bb);
}

checkBloodBank().finally(() => prisma.$disconnect());
