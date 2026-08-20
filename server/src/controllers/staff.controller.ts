import { Request, Response } from 'express';
import { prisma } from '../app';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export const getAllStaff = async (req: Request, res: Response) => {
  try {
    const staff = await prisma.user.findMany({
      where: {
        role: {
          name: {
            notIn: ['Donor']
          }
        }
      },
      include: {
        role: true,
        staffProfile: true,
        hospital: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(staff);
  } catch (error) {
    console.error('Get all staff error:', error);
    res.status(500).json({ message: 'Failed to fetch staff directory.' });
  }
};

export const createStaff = async (req: Request, res: Response) => {
  try {
    const { name, email, roleName, employeeId, branch, contactNumber, address, age, hospitalRegistration, authorizedPerson } = req.body;

    if (!name || !email || !roleName) {
      return res.status(400).json({ message: 'Name, email, and role are required.' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered.' });
    }

    const role = await prisma.role.findUnique({ where: { name: roleName } });
    if (!role) {
      return res.status(400).json({ message: 'Invalid role.' });
    }

    // Generate a temporary 8-character password
    const tempPassword = crypto.randomUUID().replace(/-/g, '').substring(0, 8);
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          passwordHash,
          roleId: role.id,
          mustChangePassword: true
        }
      });

      if (roleName === 'Hospital') {
        if (!hospitalRegistration || !contactNumber || !address || !authorizedPerson) {
          throw new Error('Hospital requires registration number, contact, address, and authorized person.');
        }
        await tx.hospital.create({
          data: {
            userId: user.id,
            name,
            registrationNumber: hospitalRegistration,
            contactDetails: contactNumber,
            address,
            authorizedPerson
          }
        });
      } else if (roleName !== 'Admin') {
        // Create Staff Profile for Receptionist, LabTechnician, CollectionStaff
        await tx.staffProfile.create({
          data: {
            userId: user.id,
            employeeId: employeeId || `EMP-${crypto.randomUUID().replace(/-/g, '').substring(0, 4).toUpperCase()}`,
            branch,
            contactNumber,
            address,
            age: age ? parseInt(age) : null
          }
        });
      }
      return user;
    });

    res.status(201).json({ 
      message: 'Staff created successfully.', 
      user: result,
      temporaryPassword: tempPassword
    });

  } catch (error: any) {
    console.error('Create staff error:', error);
    res.status(500).json({ message: error.message || 'Failed to create staff.' });
  }
};
