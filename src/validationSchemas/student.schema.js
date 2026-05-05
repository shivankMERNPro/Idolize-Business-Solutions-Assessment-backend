import { z } from 'zod';

const noHtml = z
  .string()
  .trim()
  .refine((value) => !/<[^>]*>/g.test(value), 'HTML tags are not allowed');

export const createStudentSchema = z.object({
  name: noHtml.min(1, 'Name is required').max(100, 'Name is too long'),
  email: z.string().trim().email('Invalid email format'),
  age: z
    .number()
    .int('Age must be an integer')
    .min(0, 'Age must be a positive number')
    .max(150, 'Invalid age'),
});

export const updateStudentSchema = z.object({
  name: noHtml.min(1).max(100).optional(),
  email: z.string().trim().email().optional(),
  age: z.number().int().min(0).max(150).optional(),
});
