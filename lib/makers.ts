import type { Prisma } from '@prisma/client';

export const makerKinds = ['Bakery', 'Prepared food', 'Pantry', 'Produce', 'Dairy & eggs', 'Drinks', 'Other'] as const;
export const fulfilmentOptions = ['Pickup', 'Maker delivery', 'Pickup or maker delivery', 'Market collection', 'Dine-in', 'Dine-in and takeaway', 'Direct enquiry'] as const;

export const publicMakerWhere = {
  status: 'active',
  applicationStatus: 'approved',
  makerPublished: true,
  makerHandle: { not: null },
  makerWhatsApp: { not: null },
} satisfies Prisma.SupplierWhereInput;

export const makerSummarySelect = {
  id: true, name: true, makerHandle: true, makerBio: true, makerTown: true,
  makerWhatsApp: true, makerFulfilment: true, businessType:true, businessWebsite:true, businessInstagram:true,
} satisfies Prisma.SupplierSelect;

export function openBatches(now = new Date()) {
  return { soldOut: false, cutoff: { gt: now } } satisfies Prisma.MakerBatchWhereInput;
}

const localDate = new Intl.DateTimeFormat('en-LK', {
  timeZone: 'Asia/Colombo', dateStyle: 'medium', timeStyle: 'short',
});

export function formatMakerDate(date: Date | string) {
  return localDate.format(new Date(date));
}

export function formatMakerPrice(price: number | string | { toString(): string }) {
  return `Rs. ${Number(price.toString()).toLocaleString('en-LK', { maximumFractionDigits: 2 })}`;
}

export function makerItemPath(handle: string | null, slug: string) {
  return `/makers/${handle}/items/${slug}`;
}

export function makerWhatsAppLink(phone: string | null, item: string, batch?: { readyAt: Date }) {
  if (!phone || !/^\+[1-9]\d{7,14}$/.test(phone)) return undefined;
  const when = batch ? ` Would it be available for ${formatMakerDate(batch.readyAt)} Sri Lanka time?` : '';
  const message = `Hi! I found ${item} on FreshPick and would like to enquire.${when}`;
  return `https://wa.me/${phone.slice(1)}?text=${encodeURIComponent(message)}`;
}

export function makerImageSrc(image: string | null) {
  if (!image) return undefined;
  if (/^\/uploads\/(?:products|product-images)\/[a-z\d._-]+$/i.test(image)) return image;
  try {
    const url = new URL(image);
    if (url.protocol === 'https:' && !url.username && !url.password) return url.href;
  } catch {
    return undefined;
  }
  return undefined;
}
