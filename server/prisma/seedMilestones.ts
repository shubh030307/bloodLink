import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding strict donor milestones and rewards...');

  // Level 1
  const level1 = await prisma.donorMilestone.upsert({
    where: { code: 'FIRST_DROP' },
    update: {},
    create: {
      code: 'FIRST_DROP',
      name: 'FIRST DROP',
      requiredDonations: 1,
      description: 'Your first verified donation. Welcome to BloodLink!',
      rewards: {
        create: [
          { rewardName: 'BloodLink Wristband', rewardType: 'PHYSICAL', stockQuantity: 500, lowStockThreshold: 50 },
          { rewardName: 'BloodLink Collectible Badge', rewardType: 'DIGITAL', stockQuantity: 0, lowStockThreshold: 0 },
        ]
      }
    }
  });

  // Level 2
  const level2 = await prisma.donorMilestone.upsert({
    where: { code: 'LIFE_SAVER' },
    update: {},
    create: {
      code: 'LIFE_SAVER',
      name: 'LIFE SAVER',
      requiredDonations: 5,
      description: 'You have reached 5 verified donations. A true life saver!',
      rewards: {
        create: [
          { rewardName: 'BloodLink Branded Mug', rewardType: 'PHYSICAL', stockQuantity: 200, lowStockThreshold: 20 },
          { rewardName: 'Miniature Plant', rewardType: 'PHYSICAL', stockQuantity: 150, lowStockThreshold: 15 },
        ]
      }
    }
  });

  // Level 3
  const level3 = await prisma.donorMilestone.upsert({
    where: { code: 'BLOOD_GUARDIAN' },
    update: {},
    create: {
      code: 'BLOOD_GUARDIAN',
      name: 'BLOOD GUARDIAN',
      requiredDonations: 10,
      description: 'You have completed 10 verified donations.',
      rewards: {
        create: [
          { rewardName: 'BloodLink Branded T-Shirt', rewardType: 'PHYSICAL', stockQuantity: 300, lowStockThreshold: 30 },
        ]
      }
    }
  });

  // Level 4
  const level4 = await prisma.donorMilestone.upsert({
    where: { code: 'BLOODLINK_LEGEND' },
    update: {},
    create: {
      code: 'BLOODLINK_LEGEND',
      name: 'BLOODLINK LEGEND',
      requiredDonations: 25,
      description: 'You are a legend! 25 verified donations.',
      rewards: {
        create: [
          { rewardName: 'BloodLink Branded Tote Bag', rewardType: 'PHYSICAL', stockQuantity: 100, lowStockThreshold: 10 },
          { rewardName: 'BloodLink Legend Metal Medal', rewardType: 'PHYSICAL', stockQuantity: 50, lowStockThreshold: 5 },
        ]
      }
    }
  });

  console.log('Milestone seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
