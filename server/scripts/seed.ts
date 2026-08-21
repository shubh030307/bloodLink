import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const roles = [
  'Admin',
  'Receptionist',
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
  
  // Create dummy BloodBanks for testing
  const bloodBank1 = await prisma.bloodBank.upsert({
    where: { id: 'center-1' },
    update: {},
    create: {
      id: 'center-1',
      name: 'Central City Blood Bank',
      address: '123 Main St, City Center',
      capacity: 100
    }
  });
  
  const bloodBank2 = await prisma.bloodBank.upsert({
    where: { id: 'center-2' },
    update: {},
    create: {
      id: 'center-2',
      name: 'Hope Regional Blood Center',
      address: '456 Hope Blvd, Westside',
      capacity: 150
    }
  });

  const bloodBank3 = await prisma.bloodBank.upsert({
    where: { id: 'center-3' },
    update: {},
    create: {
      id: 'center-3',
      name: 'LifeGuard Blood Services',
      address: '789 Life Rd, North District',
      capacity: 80
    }
  });
  console.log('Seeded Blood Banks');
  
  // Create dummy DonationSlots for testing
  const today = new Date();
  await prisma.donationSlot.upsert({
    where: { id: 'slot-1' },
    update: { date: today, startTime: today },
    create: {
      id: 'slot-1',
      bloodBankId: bloodBank1.id,
      date: today,
      startTime: today,
      timeSlot: '10:00 AM',
      capacity: 10
    }
  });

  await prisma.donationSlot.upsert({
    where: { id: 'slot-2' },
    update: { date: today, startTime: today },
    create: {
      id: 'slot-2',
      bloodBankId: bloodBank2.id,
      date: today,
      startTime: today,
      timeSlot: '11:00 AM',
      capacity: 15
    }
  });
  console.log('Seeded Donation Slots');
  
}

main().catch(console.error).finally(() => prisma.$disconnect());
