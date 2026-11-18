import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { approvedShop } from '@/lib/marketplace';

export async function marketplaceUser(returnTo: string) {
  const cookie = await cookies();
  const request = new NextRequest('https://freshpick.lk', { headers: { cookie: cookie.toString() } });
  const user = await verifyToken(request);
  if (!user) redirect('/auth/login?redirect=' + encodeURIComponent(returnTo));
  return user;
}

export async function hostShop() {
  const user = await marketplaceUser('/dashboard/sessions');
  return prisma.supplier.findFirst({ where: { ...approvedShop, products: { some: { id: user.userId, role: 'supplier' } } }, select: { id: true, name: true } });
}
