'use server';
import { z } from 'zod';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { hostShop } from '@/lib/marketplaceAccount';
import { occasions } from '@/lib/experiences';

const schema = z.object({
  title: z.string().trim().min(3).max(120), details: z.string().trim().min(10).max(2000),
  occasion: z.enum(occasions), dateTime: z.string().datetime({ offset: true }),
  priceLkr: z.coerce.number().int().min(0).max(1000000), capacity: z.coerce.number().int().min(1).max(1000),
});

export async function publishSession(form: FormData) {
  const shop = await hostShop();
  if (!shop) redirect('/dashboard');
  const parsed = schema.safeParse({ ...Object.fromEntries(form), dateTime: String(form.get('startsAt')) + ':00+05:30' });
  if (!parsed.success || Date.parse(parsed.data.dateTime) <= Date.now()) redirect('/dashboard/sessions?error=invalid');
  const { title, details, occasion, dateTime, priceLkr, capacity } = parsed.data;
  const added = await prisma.experienceSession.createMany({ skipDuplicates: true, data: {
    supplierId: shop.id, title, details, occasion, startsAt: new Date(dateTime), priceLkr, capacity, remaining: capacity,
  } });
  redirect('/dashboard/sessions?' + (added.count ? 'published=1' : 'error=duplicate'));
}

export async function closeSession(form: FormData) {
  const shop = await hostShop();
  if (!shop) redirect('/dashboard');
  await prisma.experienceSession.updateMany({ where: { id: String(form.get('id')), supplierId: shop.id }, data: { closed: true } });
  redirect('/dashboard/sessions');
}
