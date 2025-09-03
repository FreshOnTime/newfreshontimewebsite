import { z } from 'zod';

// Signup validation schema
export const signupSchema = z.object({
  firstName: z.string()
    .min(1, 'First name is required')
    .max(30, 'First name cannot exceed 30 characters'),
  lastName: z.string()
    .max(30, 'Last name cannot exceed 30 characters')
    .optional(),
  email: z.string()
    .email('Invalid email format')
    .optional(),
  phoneNumber: z.string()
    .min(10, 'Phone number must be at least 10 digits')
    .regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number format'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  registrationAddress: z.object({
    addressLine1: z.string().min(1, 'Address line 1 is required'),
    addressLine2: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    province: z.string().min(1, 'Province is required'),
    postalCode: z.string().min(1, 'Postal code is required'),
    country: z.string().min(1, 'Country is required'),
  })
});

// Login validation schema
export const loginSchema = z.object({
  identifier: z.string().min(1, 'Email or phone number is required'),
  password: z.string().min(1, 'Password is required')
});

// Email validation helper
export const emailSchema = z.string().email('Invalid email format');

// Phone validation helper
export const phoneSchema = z.string()
  .min(10, 'Phone number must be at least 10 digits')
  .regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number format');

// Password validation helper
export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number');

// Validate input and return errors
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): { 
  isValid: boolean; 
  data?: T; 
  errors?: Record<string, string[]> 
} {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { isValid: true, data: result.data };
  }
  
  const errors: Record<string, string[]> = {};
  result.error.issues.forEach((issue) => {
    const path = issue.path.join('.');
    if (!errors[path]) {
      errors[path] = [];
    }
    errors[path].push(issue.message);
  });
  
  return { isValid: false, errors };
}
