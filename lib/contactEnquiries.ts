import { z } from 'zod';

export const enquiryStatuses = ['new', 'in_progress', 'resolved'] as const;
export const enquirySources = ['general', 'producers', 'support'] as const;
export const enquiryTypes = ['question', 'issue', 'suggestion', 'other'] as const;
export type EnquiryStatus = typeof enquiryStatuses[number];
export type EnquirySource = typeof enquirySources[number];
export type EnquiryType = typeof enquiryTypes[number];
export const contactSchema = z.object({
  submissionId: z.string().uuid().optional(),
  name: z.string().trim().min(1, 'Enter your name.').max(100),
  email: z.string().trim().email('Enter a valid email address.').max(254).transform(value => value.toLowerCase()),
  subject: z.string().trim().max(160).default(''),
  message: z.string().trim().min(1, 'Enter your question or message.').max(5000, 'Keep your message within 5,000 characters.'),
  type: z.enum(enquiryTypes).default('question'),
  source: z.enum(enquirySources).default('general'),
  priority: z.enum(['low', 'normal', 'high']).default('normal'),
  orderId: z.string().trim().max(100).default(''),
});
export const enquiryStatusLabels: Record<EnquiryStatus,string> = { new: 'New', in_progress: 'In progress', resolved: 'Resolved' };
export const enquirySourceLabels: Record<EnquirySource,string> = { general: 'Contact page', producers: 'Our Producers', support: 'Support' };
export interface Enquiry {
  id: string; name: string; email: string; subject: string; message: string;
  type: EnquiryType; source: EnquirySource; priority: 'low' | 'normal' | 'high'; orderId: string;
  status: EnquiryStatus; internalNotes: string; version: number; createdAt: string; updatedAt: string;
}
export function enquiryReference(id: string) { return `FP-${id.slice(0,8).toUpperCase()}`; }
