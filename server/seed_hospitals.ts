import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting to seed hospitals...');

  // Ensure "Hospital" role exists
  let hospitalRole = await prisma.role.findUnique({
    where: { name: 'Hospital' }
  });

  if (!hospitalRole) {
    hospitalRole = await prisma.role.create({
      data: { name: 'Hospital' }
    });
  }

  const passwordHash = await bcrypt.hash('password123', 10);

  const sampleHospitals = [
    {
      name: 'City Central Blood Bank',
      email: 'contact@citycentral.com',
      address: '123 Main St, New York, NY',
      regNo: 'REG-1001',
      authPerson: 'Dr. John Smith'
    },
    {
      name: 'Metro General Hospital Blood Center',
      email: 'bloodcenter@metrogeneral.org',
      address: '456 Health Ave, New York, NY',
      regNo: 'REG-1002',
      authPerson: 'Dr. Sarah Johnson'
    },
    {
      name: 'Sunrise Community Blood Drive',
      email: 'hello@sunriseblood.com',
      address: '789 Sunrise Blvd, Brooklyn, NY',
      regNo: 'REG-1003',
      authPerson: 'Mark Williams'
    }
  ];

  for (const h of sampleHospitals) {
    // Check if user already exists
    let user = await prisma.user.findUnique({ where: { email: h.email } });
    
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: h.name,
          email: h.email,
          passwordHash,
          roleId: hospitalRole.id
        }
      });
      console.log(`Created user: ${h.name}`);
    }

    const hospital = await prisma.hospital.findUnique({ where: { userId: user.id } });
    
    let createdHospitalId = hospital?.id;

    if (!hospital) {
      const newHospital = await prisma.hospital.create({
        data: {
          userId: user.id,
          registrationNumber: h.regNo,
          contactDetails: '1-800-BLOOD-NYC',
          address: h.address,
          authorizedPerson: h.authPerson,
          status: 'Approved'
        }
      });
      createdHospitalId = newHospital.id;
      console.log(`Created hospital profile for: ${h.name}`);
    }

    if (createdHospitalId) {
      const bloodBank = await prisma.bloodBank.findUnique({ where: { id: createdHospitalId } });
      if (!bloodBank) {
        await prisma.bloodBank.create({
          data: {
            id: createdHospitalId,
            name: h.name,
            address: h.address,
            capacity: 50
          }
        });
        console.log(`Created linked BloodBank profile for: ${h.name}`);
      }
    }
  }

  console.log('Seeding complete!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
