import { Request, Response } from 'express';
import { prisma } from '../app';

export const getAllHospitals = async (req: Request, res: Response): Promise<void> => {
  try {
    const hospitals = await prisma.hospital.findMany({
      include: {
        user: { select: { name: true, email: true } }
      }
    });
    res.json(hospitals);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch hospitals' });
  }
};

export const updateHospitalStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { status } = req.body;
    
    const hospital = await prisma.hospital.update({
      where: { id },
      data: { status }
    });
    res.json(hospital);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update hospital status' });
  }
};
