import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding blood banks...');

  const sampleBanks = [
    {
      name: 'Central City Blood Bank',
      address: '123 Health Ave, Central City',
      capacity: 100,
    },
    {
      name: 'LifeGuard Blood Center',
      address: '456 Wellness Blvd, Northside',
      capacity: 150,
    },
    {
      name: 'Metro General Hospital Blood Bank',
      address: '789 Medical Parkway, Downtown',
      capacity: 200,
    },
  ];

  for (const bank of sampleBanks) {
    const existing = await prisma.bloodBank.findFirst({
      where: { name: bank.name },
    });

    if (!existing) {
      await prisma.bloodBank.create({
        data: bank,
      });
      console.log(`Created blood bank: ${bank.name}`);
    } else {
      console.log(`Blood bank already exists: ${bank.name}`);
    }
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
