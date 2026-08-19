import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jsonwebtoken from 'jsonwebtoken';
import { prisma } from '../server';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, roleName, ...otherDetails } = req.body;

    // Check if role exists
    let role = await prisma.role.findUnique({ where: { name: roleName } });
    if (!role) {
      // For development, auto-create roles if they don't exist
      role = await prisma.role.create({ data: { name: roleName } });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ error: 'User already exists' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        roleId: role.id,
      },
    });

    // Create role-specific record
    if (roleName === 'Donor') {
      const age = parseInt(otherDetails.age) || 0;
      if (age < 18 || age > 65) {
        // Rollback user creation
        await prisma.user.delete({ where: { id: user.id } });
        res.status(400).json({ error: 'Donor age must be between 18 and 65 years' });
        return;
      }
      
      const validBloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
      if (!validBloodGroups.includes(otherDetails.bloodGroup)) {
        await prisma.user.delete({ where: { id: user.id } });
        res.status(400).json({ error: 'Invalid blood group' });
        return;
      }

      const donorCount = await prisma.donor.count();
      const donorNumber = `DNR-${new Date().getFullYear()}-${String(donorCount + 1).padStart(6, '0')}`;

      await prisma.donor.create({
        data: {
          donorNumber,
          userId: user.id,
          age,
          gender: otherDetails.gender || '',
          bloodGroup: otherDetails.bloodGroup || '',
          mobileNumber: otherDetails.mobileNumber || '',
          address: otherDetails.address || '',
          emergencyContact: {
            create: {
              name: otherDetails.emergencyContactName || '',
              relationship: otherDetails.emergencyContactRelationship || '',
              mobileNumber: otherDetails.emergencyContactNumber || '',
            }
          }
        }
      });
    } else if (roleName === 'Hospital') {
      await prisma.hospital.create({
        data: {
          userId: user.id,
          name: otherDetails.name || name,
          registrationNumber: otherDetails.registrationNumber || '',
          contactDetails: otherDetails.contactDetails || '',
          address: otherDetails.address || '',
          authorizedPerson: otherDetails.authorizedPerson || '',
        }
      });
    }

    const token = jsonwebtoken.sign({ userId: user.id, role: roleName }, JWT_SECRET, { expiresIn: '1d' });

    res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, role: roleName } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ 
      where: { email },
      include: { role: true }
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = jsonwebtoken.sign({ userId: user.id, role: user.role.name }, JWT_SECRET, { expiresIn: '1d' });

    res.status(200).json({ 
      token, 
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        role: user.role.name 
      } 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    // Note: req.user is populated by authenticate middleware
    const { userId } = (req as any).user;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role.name
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

