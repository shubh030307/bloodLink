import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'shubhrojyotisaha@gmail.com' },
    include: { role: true, donor: { include: { emergencyContact: true, milestoneAchievements: true } } }
  });
  console.dir(user, { depth: null });
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
