import { z } from 'zod';
import prisma from '@/lib/prisma';
import { approvedShop } from '@/lib/marketplace';

export const bookingInput = z.object({
  sessionId: z.string().uuid(), requestId: z.string().uuid(), seats: z.number().int().min(1).max(20),
  guestName: z.string().trim().min(1).max(100),
});
export class BookingError extends Error {}

export async function bookExperience(userId: string, input: z.infer<typeof bookingInput>) {
  const data = bookingInput.parse(input);
  return prisma.$transaction(async tx => {
    // Serialize retries for this customer, including two different sessions using the same key.
    await tx.$queryRaw`SELECT id FROM users WHERE id = ${userId} FOR UPDATE`;
    const prior = await tx.experienceBooking.findUnique({ where: { userId_requestId: { userId, requestId: data.requestId } } });
    if (prior) {
      if (prior.sessionId !== data.sessionId || prior.seats !== data.seats || prior.guestName !== data.guestName)
        throw new BookingError('This request reference already belongs to another booking.');
      return prior;
    }
    const reserved = await tx.experienceSession.updateMany({
      where: { id: data.sessionId, closed: false, supplier: approvedShop, startsAt: { gt: new Date() }, remaining: { gte: data.seats } },
      data: { remaining: { decrement: data.seats } },
    });
    if (!reserved.count) throw new BookingError('These places are no longer available.');
    const session = await tx.experienceSession.findUniqueOrThrow({ where: { id: data.sessionId }, select: { priceLkr: true } });
    return tx.experienceBooking.create({ data: { ...data, userId, totalLkr: session.priceLkr * data.seats } });
  });
}

export function listBookings(userId: string, page = 1) {
  return prisma.experienceBooking.findMany({ where: { userId }, include: { session: { select: {
    title: true, startsAt: true, supplier: { select: { name: true } },
  } } }, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], take: 24, skip: (page - 1) * 24 });
}

export async function cancelBooking(userId: string, id: string) {
  return prisma.$transaction(async tx => {
    const booking = await tx.experienceBooking.findFirst({ where: { id, userId } });
    if (!booking) throw new BookingError('Booking could not be found.');
    if (booking.cancelled) return { id, cancelled: true };
    const updated = await tx.experienceBooking.updateMany({ where: { id, userId, cancelled: false, session: { startsAt: { gt: new Date() } } }, data: { cancelled: true } });
    if (updated.count) await tx.experienceSession.update({ where: { id: booking.sessionId }, data: { remaining: { increment: booking.seats } } });
    else if (!(await tx.experienceBooking.findUniqueOrThrow({ where: { id } })).cancelled) throw new BookingError('The session has already started.');
    return { id, cancelled: true };
  });
}
