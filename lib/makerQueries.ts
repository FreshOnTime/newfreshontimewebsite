import { cache } from 'react';
import prisma from '@/lib/prisma';
import { makerSummarySelect, publicMakerWhere } from '@/lib/makers';

export const findPublicMaker = cache((handle: string) => prisma.supplier.findFirst({
  where: { ...publicMakerWhere, makerHandle: handle },
  select: makerSummarySelect,
}));

export const publicItemSelect = {
  id: true, slug: true, name: true, description: true, price: true,
  image: true, kind: true, madeToOrder: true,
  contactWhatsApp: true, contactEmail: true, contactPhone: true, contactWebsite: true, purchaseUrl: true,
} as const;
