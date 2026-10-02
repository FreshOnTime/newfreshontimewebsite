import { z } from 'zod';

export const orderAddressSchema = z.object({
  name: z.string().trim().min(1, 'Recipient name is required').max(120),
  phone: z.string().trim().min(1, 'Phone is required').max(40),
  street: z.string().trim().min(1, 'Street address is required').max(300),
  city: z.string().trim().min(1, 'City is required').max(120),
  state: z.string().trim().max(120).optional().default(''),
  zipCode: z.string().trim().max(30).optional().default(''),
  country: z.string().trim().min(1, 'Country is required').max(80),
});
