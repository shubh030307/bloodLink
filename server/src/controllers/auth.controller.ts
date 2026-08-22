import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { prisma } from '../app';

const getJWTSecret = (req: any): Uint8Array => {
  const secret = req.env?.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }

  return new TextEncoder().encode(secret);
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, roleName, ...otherDetails } = req.body;

    let role = await prisma.role.findUnique({
      where: { name: roleName }
    });

    if (!role) {
      role = await prisma.role.create({
        data: { name: roleName }
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      res.status(400).json({
        error: 'User already exists'
      });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        roleId: role.id
      }
    });

    if (roleName === 'Donor') {
      const age = parseInt(otherDetails.age) || 0;

      if (age < 18 || age > 65) {
        await prisma.user.delete({
          where: { id: user.id }
        });

        res.status(400).json({
          error: 'Donor age must be between 18 and 65 years'
        });
        return;
      }

      const validBloodGroups = [
        'A+', 'A-', 'B+', 'B-',
        'AB+', 'AB-', 'O+', 'O-'
      ];

      if (!validBloodGroups.includes(otherDetails.bloodGroup)) {
        await prisma.user.delete({
          where: { id: user.id }
        });

        res.status(400).json({
          error: 'Invalid blood group'
        });
        return;
      }

      const donorCount = await prisma.donor.count();

      const donorNumber =
        `DNR-${new Date().getFullYear()}-${String(donorCount + 1).padStart(6, '0')}`;

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
              name:
                otherDetails.emergencyContact?.name ||
                otherDetails.emergencyContactName ||
                '',
              relationship:
                otherDetails.emergencyContact?.relationship ||
                otherDetails.emergencyContactRelationship ||
                '',
              mobileNumber:
                otherDetails.emergencyContact?.mobileNumber ||
                otherDetails.emergencyContactNumber ||
                ''
            }
          }
        }
      });
    }

    if (roleName === 'Hospital') {
      await prisma.hospital.create({
        data: {
          userId: user.id,
          name: otherDetails.name || name,
          registrationNumber: otherDetails.registrationNumber || '',
          contactDetails: otherDetails.contactDetails || '',
          address: otherDetails.address || '',
          authorizedPerson: otherDetails.authorizedPerson || ''
        }
      });
    }

    const token = await new SignJWT({
      userId: user.id,
      role: roleName
    })
      .setProtectedHeader({
        alg: 'HS256',
        typ: 'JWT'
      })
      .setIssuedAt()
      .setExpirationTime('1d')
      .sign(getJWTSecret(req));

    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: roleName
      }
    });
  } catch (error) {
    console.error('REGISTER ERROR:', error);

    res.status(500).json({
      error: 'Internal server error'
    });
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
      res.status(401).json({
        error: 'Invalid credentials'
      });
      return;
    }

    const isMatch = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!isMatch) {
      res.status(401).json({
        error: 'Invalid credentials'
      });
      return;
    }

    const token = await new SignJWT({
      userId: user.id,
      role: user.role.name
    })
      .setProtectedHeader({
        alg: 'HS256',
        typ: 'JWT'
      })
      .setIssuedAt()
      .setExpirationTime('1d')
      .sign(getJWTSecret(req));

    res.status(200).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.name,
        mustChangePassword: user.mustChangePassword
      }
    });
  } catch (error) {
    console.error('LOGIN ERROR:', error);

    res.status(500).json({
      error: 'Internal server error'
    });
  }
};

export const getMe = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId } = (req as any).user;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true }
    });

    if (!user) {
      res.status(404).json({
        error: 'User not found'
      });
      return;
    }

    res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role.name,
      mustChangePassword: user.mustChangePassword
    });
  } catch (error) {
    console.error('GET ME ERROR:', error);

    res.status(500).json({
      error: 'Internal server error'
    });
  }
};

export const changePassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId } = (req as any).user;

    const {
      currentPassword,
      newPassword
    } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      res.status(404).json({
        error: 'User not found'
      });
      return;
    }

    const isMatch = await bcrypt.compare(
      currentPassword,
      user.passwordHash
    );

    if (!isMatch) {
      res.status(401).json({
        error: 'Invalid current password'
      });
      return;
    }

    const passwordHash = await bcrypt.hash(
      newPassword,
      10
    );

    await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash,
        mustChangePassword: false
      }
    });

    res.status(200).json({
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('CHANGE PASSWORD ERROR:', error);

    res.status(500).json({
      error: 'Internal server error'
    });
  }
};