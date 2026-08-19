const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  await prisma.labReport.deleteMany();
  console.log('Cleared LabReport');
}
run().finally(() => prisma.$disconnect());
