import { z } from 'zod';
const money = z.coerce.number().finite().positive().max(9999999999.99).refine(value=>Math.abs(value*100-Math.round(value*100))<0.0001,'Use at most two decimal places');
export const planContentSchema = z.object({
  name:z.string().trim().min(1).max(150), quantity:z.string().trim().min(1).max(100),category:z.string().trim().max(100).default(''),
  productId:z.string().trim().max(100).nullable().optional().transform(value=>value||null), units:z.coerce.number().int().min(1).max(10000).default(1),
});
const fields = z.object({
  name:z.string().trim().min(1).max(150),description:z.string().trim().min(1).max(5000),shortDescription:z.string().trim().min(1).max(300),price:money,
  originalPrice:money.nullable().optional(),frequency:z.enum(['weekly','biweekly','monthly']),
  image:z.string().trim().max(2048).refine(value=>!value||/^\/(?!\/)/.test(value)||/^https:\/\//.test(value),'Use a local image path or HTTPS URL'),
  icon:z.string().max(40).optional(),color:z.string().max(40).optional(),features:z.array(z.string().trim().min(1).max(300)).max(30).optional(),
  isActive:z.boolean(),isFeatured:z.boolean(),maxSubscribers:z.number().int().min(1).max(1000000).nullable().optional(),inventoryManaged:z.boolean(),contents:z.array(planContentSchema).max(40),
});
export const createPlanSchema=fields.extend({frequency:fields.shape.frequency.default('weekly'),image:fields.shape.image.default('/images/subscription-default.jpg'),isActive:z.boolean().default(true),isFeatured:z.boolean().default(false),inventoryManaged:z.boolean().default(false),contents:fields.shape.contents.default([])});
export const updatePlanSchema=fields.partial().extend({version:z.string().datetime()});
