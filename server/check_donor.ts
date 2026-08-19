import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDonor() {
  const users = await prisma.user.findMany({
    include: { donor: true, role: true }
  });
  console.log(users.map(u => ({ id: u.id, name: u.name, role: u.role.name, hasDonorProfile: !!u.donor })));
}

checkDonor().finally(() => prisma.$disconnect());
