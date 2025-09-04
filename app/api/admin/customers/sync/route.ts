import { NextResponse } from 'next/server';
import { z } from 'zod';
import connectDB from '@/lib/database';
import User from '@/lib/models/User';
import Customer from '@/lib/models/Customer';
import { requireAdminSimple } from '@/lib/middleware/adminAuth';
import type { Types } from 'mongoose';

const bodySchema = z.object({
  dryRun: z.boolean().optional().default(false),
  overwrite: z.boolean().optional().default(false),
});

type RegAddressLean = {
  streetAddress?: string;
  streetAddress2?: string;
  city?: string;
  town?: string;
  state?: string;
  postalCode?: string;
  countryCode?: string;
};

function mapAddress(addr?: RegAddressLean) {
  if (!addr) return undefined;
  const streetParts = [addr.streetAddress, addr.streetAddress2].filter(
    (v): v is string => Boolean(v)
  );
  const street = streetParts.join(', ');
  return {
    street,
    city: addr.city || addr.town || '',
    state: addr.state || '',
    zipCode: addr.postalCode || '',
    country: addr.countryCode || '',
  } as {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  } | undefined;
}

export const POST = requireAdminSimple(async (request) => {
  try {
    await connectDB();

    let body: unknown = undefined;
    try { body = await request.json(); } catch {}
    const { dryRun, overwrite } = bodySchema.parse(body ?? {});

    type UserLean = {
      _id: Types.ObjectId;
      userId: string;
      firstName: string;
      lastName?: string;
      email?: string;
      phoneNumber: string;
      registrationAddress?: RegAddressLean;
    };
    const users = await User.find({ role: 'customer' }).lean<UserLean[]>();
    let created = 0;
    let updated = 0;
    let skipped = 0;
    const errors: Array<{ userId: string; reason: string }> = [];

    for (const u of users) {
      try {
  const fullName = `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.phoneNumber || 'Customer';
  const email = u.email || `${u.userId}@placeholder.local`;
  const phone = u.phoneNumber;
  const address = mapAddress(u.registrationAddress);

        // Try find existing customer by email, else by phone
        type CustomerLean = { _id: Types.ObjectId } & Partial<{
          name: string;
          email: string;
          phone: string;
        }>;
        let existing = await Customer.findOne({ email }).lean<CustomerLean | null>();
        if (!existing && phone) existing = await Customer.findOne({ phone }).lean<CustomerLean | null>();

        if (!existing) {
          if (!dryRun) {
            await Customer.create({ name: fullName, email, phone, address });
          }
          created++;
        } else if (overwrite && existing) {
          if (!dryRun) {
            await Customer.updateOne({ _id: existing._id }, { $set: { name: fullName, phone, address } });
          }
          updated++;
        } else {
          skipped++;
        }
      } catch (e: unknown) {
        const reason = e instanceof Error ? e.message : 'unknown error';
        errors.push({ userId: String(u._id || u.userId), reason });
      }
    }

    return NextResponse.json({
      success: true,
      dryRun,
      overwrite,
      scanned: users.length,
      created,
      updated,
      skipped,
      errors,
    });
  } catch (error) {
    console.error('Sync customers error:', error);
    return NextResponse.json({ error: 'Failed to sync customers' }, { status: 500 });
  }
});
