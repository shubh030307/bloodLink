const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const tests = [
  { testCode: 'HIV-1/2', testName: 'HIV 1/2 Antibodies', category: 'Infectious Disease', resultType: 'QUALITATIVE' },
  { testCode: 'HBSAG', testName: 'Hepatitis B Surface Antigen', category: 'Infectious Disease', resultType: 'QUALITATIVE' },
  { testCode: 'ANTI-HCV', testName: 'Hepatitis C Antibodies', category: 'Infectious Disease', resultType: 'QUALITATIVE' },
  { testCode: 'VDRL', testName: 'Syphilis (VDRL/RPR)', category: 'Infectious Disease', resultType: 'QUALITATIVE' },
  { testCode: 'MALARIA', testName: 'Malaria Parasite', category: 'Infectious Disease', resultType: 'QUALITATIVE' },
  { testCode: 'ABO-RH', testName: 'ABO & RhD Blood Typing', category: 'Immunohematology', resultType: 'ENUM', referenceInformation: 'A+, A-, B+, B-, AB+, AB-, O+, O-' },
  { testCode: 'HGB', testName: 'Hemoglobin Estimation', category: 'Hematology', resultType: 'NUMERIC', unit: 'g/dL', referenceInformation: '> 12.5 g/dL' }
];

async function seed() {
  console.log('Seeding Laboratory Tests...');
  for (const t of tests) {
    await prisma.laboratoryTest.upsert({
      where: { testCode: t.testCode },
      update: {},
      create: t
    });
  }
  console.log('Done seeding.');
}

seed()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
