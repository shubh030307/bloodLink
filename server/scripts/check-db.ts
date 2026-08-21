import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    include: { donor: { include: { emergencyContact: true } } }
  });
  console.dir(users, { depth: null });
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
