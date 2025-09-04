import connectDB from '@/lib/database';
import User from '@/lib/models/User';
import Customer from '@/lib/models/Customer';
import type { Types } from 'mongoose';

async function run() {
  await connectDB();
  type UserLean = {
    _id: Types.ObjectId;
    userId: string;
    firstName: string;
    lastName?: string;
    email?: string;
    phoneNumber: string;
    registrationAddress?: {
      streetAddress?: string;
      streetAddress2?: string;
      city?: string;
      town?: string;
      state?: string;
      postalCode?: string;
      countryCode?: string;
    };
  };
  const users = await User.find({ role: 'customer' }).lean<UserLean[]>();

  let created = 0;
  let updated = 0;
  let skipped = 0;
  const errors: Array<{ userId: string; reason: string }> = [];

  const mapAddress = (addr?: UserLean['registrationAddress']) => {
    if (!addr) return undefined;
    const street = [addr.streetAddress, addr.streetAddress2].filter(Boolean).join(', ');
    return {
      street,
      city: addr.city || addr.town || '',
      state: addr.state || '',
      zipCode: addr.postalCode || '',
      country: addr.countryCode || '',
    };
  };

  for (const u of users) {
    try {
      const fullName = `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.phoneNumber || 'Customer';
      const email = u.email || `${u.userId}@placeholder.local`;
      const phone = u.phoneNumber;
  const address = mapAddress(u.registrationAddress);

      // find existing by email then phone
  let existing = await Customer.findOne({ email }).lean<{ _id: Types.ObjectId } | null>();
  if (!existing && phone) existing = await Customer.findOne({ phone }).lean<{ _id: Types.ObjectId } | null>();

      if (!existing) {
        await Customer.create({ name: fullName, email, phone, address });
        created++;
      } else {
        // update minimal fields if missing
        const setUpdate: Record<string, unknown> = {};
        if (!('name' in existing) || !existing.name) setUpdate.name = fullName;
        if (!('phone' in existing) || !existing.phone) setUpdate.phone = phone;
        if (address) setUpdate.address = address;
        if (Object.keys(setUpdate).length && existing) {
          await Customer.updateOne({ _id: existing._id }, { $set: setUpdate });
          updated++;
        } else {
          skipped++;
        }
      }
    } catch (e: unknown) {
  errors.push({ userId: String(u._id || u.userId), reason: e instanceof Error ? e.message : 'unknown' });
    }
  }

  console.log(JSON.stringify({ scanned: users.length, created, updated, skipped, errors }, null, 2));
  process.exit(0);
}

run().catch((e) => {
  console.error('Backfill failed:', e);
  process.exit(1);
});
