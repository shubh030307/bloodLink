import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const roles = [
    'Admin',
    'Receptionist',
    'MedicalStaff',
    'CollectionStaff',
    'LabTechnician',
    'Hospital',
    'Donor'
  ];

  for (const roleName of roles) {
    await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName }
    });
  }

  const hospitalRole = await prisma.role.findUnique({ where: { name: 'Hospital' } });
  const donorRole = await prisma.role.findUnique({ where: { name: 'Donor' } });

  const hash = await bcrypt.hash('password123', 10);

  // Helper to create a user for a specific role
  const createMockUser = async (roleName: string, email: string) => {
    const role = await prisma.role.findUnique({ where: { name: roleName } });
    if (!role) return;

    return await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        passwordHash: hash,
        name: `${roleName} User`,
        roleId: role.id
      }
    });
  };

  await createMockUser('Admin', 'admin@test.com');
  await createMockUser('Receptionist', 'receptionist@test.com');
  await createMockUser('MedicalStaff', 'medical@test.com');
  await createMockUser('CollectionStaff', 'collection@test.com');
  await createMockUser('LabTechnician', 'lab@test.com');

  // Create a Hospital user
  const hospitalUser = await prisma.user.upsert({
    where: { email: 'hospital@test.com' },
    update: {},
    create: {
      email: 'hospital@test.com',
      passwordHash: hash,
      name: 'City General Hospital',
      roleId: hospitalRole!.id
    }
  });

  const hospital = await prisma.hospital.upsert({
    where: { userId: hospitalUser.id },
    update: {},
    create: {
      userId: hospitalUser.id,
      name: 'City General Hospital',
      registrationNumber: 'HOSP-123',
      address: '123 Health St',
      contactDetails: '1234567890',
      authorizedPerson: 'Dr. Smith'
    }
  });

  // Create a Donor user
  const donorUser = await prisma.user.upsert({
    where: { email: 'donor@test.com' },
    update: {},
    create: {
      email: 'donor@test.com',
      passwordHash: hash,
      name: 'John Doe',
      roleId: donorRole!.id
    }
  });

  const donorCount = await prisma.donor.count();
  const donor = await prisma.donor.upsert({
    where: { userId: donorUser.id },
    update: {},
    create: {
      donorNumber: `DNR-2026-${String(donorCount + 1).padStart(6, '0')}`,
      userId: donorUser.id,
      bloodGroup: 'O+',
      mobileNumber: '0987654321',
      age: 30,
      gender: 'MALE',
      address: '456 Donor Ave'
    }
  });

  // Create a Blood Bank
  // Wait, BloodBank has NO unique constraint on name. 
  // Let's just create one if none exist.
  let bloodBank = await prisma.bloodBank.findFirst({ where: { name: 'Central Blood Bank' } });
  if (!bloodBank) {
    bloodBank = await prisma.bloodBank.create({
      data: {
        name: 'Central Blood Bank',
        address: '789 Life Rd',
        capacity: 50
      }
    });
  }

  // Also create a DonationSlot for the blood bank so test_api can use it
  let slot = await prisma.donationSlot.findFirst({ where: { bloodBankId: bloodBank.id } });
  if (!slot) {
    slot = await prisma.donationSlot.create({
      data: {
        bloodBankId: bloodBank.id,
        date: new Date('2026-08-19'),
        timeSlot: '09:00 AM',
        capacity: 10
      }
    });
  }

  // Seed Laboratory Tests
  const labTests = [
    { testCode: 'ABO_RH', testName: 'ABO and RhD Blood Typing', category: 'Immunohematology', resultType: 'ENUM', referenceInformation: 'Positive/Negative/ABO Group', isRequired: true },
    { testCode: 'HIV_1_2', testName: 'HIV 1/2 Antibodies', category: 'Infectious Disease', resultType: 'ENUM', referenceInformation: 'Non-Reactive', isRequired: true },
    { testCode: 'HBSAG', testName: 'Hepatitis B Surface Antigen (HBsAg)', category: 'Infectious Disease', resultType: 'ENUM', referenceInformation: 'Non-Reactive', isRequired: true },
    { testCode: 'HCV', testName: 'Hepatitis C Virus Antibodies (Anti-HCV)', category: 'Infectious Disease', resultType: 'ENUM', referenceInformation: 'Non-Reactive', isRequired: true },
    { testCode: 'SYPHILIS', testName: 'Syphilis (VDRL/RPR)', category: 'Infectious Disease', resultType: 'ENUM', referenceInformation: 'Non-Reactive', isRequired: true },
    { testCode: 'MALARIA', testName: 'Malaria Parasite', category: 'Infectious Disease', resultType: 'ENUM', referenceInformation: 'Negative', isRequired: true }
  ];

  for (const test of labTests) {
    await prisma.laboratoryTest.upsert({
      where: { testCode: test.testCode },
      update: {},
      create: test
    });
  }

  console.log('Seed completed.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
