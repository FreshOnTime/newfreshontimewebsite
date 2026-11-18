'use server';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { marketplaceUser } from '@/lib/marketplaceAccount';
import { BookingError, bookingInput, bookExperience, cancelBooking } from '@/lib/experienceBookings';

export async function reserve(form: FormData) {
  const parsed = bookingInput.safeParse({ ...Object.fromEntries(form), seats: Number(form.get('seats')) });
  if (!parsed.success) redirect('/bookings?error=invalid');
  const user = await marketplaceUser('/sessions/' + parsed.data.sessionId);
  try { await bookExperience(user.userId, parsed.data); }
  catch (err) {
    if (!(err instanceof BookingError)) throw err;
    redirect('/sessions/' + parsed.data.sessionId + '?error=availability');
  }
  redirect('/bookings');
}

export async function cancel(form: FormData) {
  const user = await marketplaceUser('/bookings');
  const id = z.string().uuid().safeParse(form.get('bookingId'));
  if (!id.success) redirect('/bookings?error=invalid');
  try { await cancelBooking(user.userId, id.data); }
  catch (err) {
    if (!(err instanceof BookingError)) throw err;
    redirect('/bookings?error=cancel');
  }
  redirect('/bookings');
}
