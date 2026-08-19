import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const roles = [
  'Admin',
  'Receptionist',
  'MedicalStaff',
  'CollectionStaff',
  'LabTechnician',
  'Hospital',
  'Donor'
];

async function main() {
  console.log('Seeding roles and users...');
  
  for (const roleName of roles) {
    const role = await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName }
    });
    
    const email = `${roleName.toLowerCase()}@example.com`;
    const passwordHash = await bcrypt.hash('password123', 10);
    
    const createdUser = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        passwordHash,
        name: `Test ${roleName}`,
        roleId: role.id
      }
    });
    
    // Create specific entity records if needed
    if (roleName === 'Hospital') {
      await prisma.hospital.upsert({
        where: { userId: createdUser.id },
        update: {},
        create: {
          userId: createdUser.id,
          name: 'City General Hospital',
          registrationNumber: 'HOSP-999',
          address: '999 Hospital Way',
          contactDetails: '1234567890',
          authorizedPerson: 'Dr. House'
        }
      });
    } else if (roleName === 'Donor') {
      const donorCount = await prisma.donor.count();
      await prisma.donor.upsert({
        where: { userId: createdUser.id },
        update: {},
        create: {
          donorNumber: `DNR-9999-${String(donorCount + 1).padStart(6, '0')}`,
          userId: createdUser.id,
          bloodGroup: 'A+',
          mobileNumber: '1112223333',
          age: 25,
          gender: 'MALE',
          address: '111 Donor Street'
        }
      });
    }
    
    console.log(`Seeded user: ${email} / password123`);
  }
  
  // Create a dummy BloodBank for testing
  const bloodBank = await prisma.bloodBank.upsert({
    where: { id: 'center-1' },
    update: {},
    create: {
      id: 'center-1',
      name: 'Main Blood Center',
      address: '123 Main St',
      capacity: 100
    }
  });
  console.log('Seeded Main Blood Center');
  
  // Create a dummy DonationSlot for testing
  await prisma.donationSlot.upsert({
    where: { id: 'slot-1' },
    update: {},
    create: {
      id: 'slot-1',
      bloodBankId: bloodBank.id,
      date: new Date('2026-08-19'),
      timeSlot: '10:00 AM',
      capacity: 5
    }
  });
  console.log('Seeded Donation Slot');
  
}

main().catch(console.error).finally(() => prisma.$disconnect());
