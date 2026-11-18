import { z } from 'zod';

const shortText = z.string().trim().min(1).max(140);
const amount = z.coerce.number().positive().max(99999999).multipleOf(0.01);
const date = z.string().date();
export const buyingRequest = z.object({
  product: shortText, unit: shortText, quantity: amount, grade: shortText,
  area: shortText, deadline: date, pickup: date,
}).refine(row => row.deadline <= row.pickup, 'Close offers on or before the pickup day.');

const phone = z.string().trim().max(32).transform(value => value.replace(/[\s()-]/g, '').replace(/^0/, '+94'))
  .pipe(z.string().regex(/^\+94\d{9}$/, 'Use a Sri Lankan phone number, for example 0771234567.'));
export const growerOffer = z.object({
  submissionId: z.string().uuid(), requestId: shortText.optional(),
  product: shortText, unit: shortText, quantity: amount, price: amount, area: shortText,
  ready: date, phone,
  photoUrl: z.string().trim().max(2000).url().startsWith('https://').optional(),
});

export const decision = z.discriminatedUnion('action', [
  z.object({ id: shortText, action: z.literal('propose'), agreedQty: amount, agreedPrice: amount, terms: z.string().trim().min(1).max(1000) }),
  z.object({ id: shortText, action: z.literal('decline'), terms: z.string().trim().min(1).max(1000) }),
  z.object({ id: shortText, action: z.literal('confirm') }),
  z.object({ id: shortText, action: z.literal('handover') }),
]);

export function colomboDay(now = new Date()) {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Colombo' }).format(now);
}
