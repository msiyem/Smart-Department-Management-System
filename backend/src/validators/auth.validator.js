import { z } from 'zod';

export const registerSchema = z.object({
  full_name: z.string().min(2).max(100).trim(),
  email:     z.string().email().toLowerCase().trim(),
  password:  z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[0-9]/, 'Must contain a number'),
  role: z.enum(['admin', 'teacher', 'student']),

  // student-specific
  registration_no: z.string().max(50).optional(),
  session:         z.string().max(20).optional(),
  semester:        z.coerce.number().int().min(1).max(12).optional(),

  // teacher-specific
  designation: z.string().max(100).optional(),
});

export const loginSchema = z.object({
  email:    z.string().email().toLowerCase().trim(),
  password: z.string().min(1),
});

export const changePasswordSchema = z.object({
  current_password: z.string().min(1),
  new_password:     z
    .string()
    .min(8)
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[0-9]/, 'Must contain a number'),
});
