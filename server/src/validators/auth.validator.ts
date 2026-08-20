import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    name: z.string().min(1, 'Name is required'),
    roleName: z.enum(['Donor', 'Hospital', 'Admin', 'Receptionist', 'CollectionStaff', 'LabTechnician']),
    // Donor specific
    age: z.string().optional().or(z.number().optional()),
    gender: z.string().optional(),
    bloodGroup: z.string().optional(),
    mobileNumber: z.string().optional(),
    address: z.string().optional(),
    emergencyContactName: z.string().optional(),
    emergencyContactRelationship: z.string().optional(),
    emergencyContactNumber: z.string().optional(),
    // Hospital specific
    registrationNumber: z.string().optional(),
    contactDetails: z.string().optional(),
    authorizedPerson: z.string().optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  }),
});
