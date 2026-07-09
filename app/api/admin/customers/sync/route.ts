import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdminSimple } from '@/lib/middleware/adminAuth';

// OBSOLETE: customers are unified with the users table (role = 'customer').
// There is no separate Customer collection to sync into anymore, so this
// endpoint is now a no-op that simply reports how many customer users exist.
export const POST = requireAdminSimple(async () => {
  try {
    const scanned = await prisma.user.count({ where: { role: 'customer' } });

    return NextResponse.json({
      success: true,
      message: 'Customers are unified with the users table; no sync needed.',
      scanned,
      created: 0,
      updated: 0,
      skipped: 0,
    });
  } catch (error) {
    console.error('Sync customers error:', error);
    return NextResponse.json({ error: 'Failed to sync customers' }, { status: 500 });
  }
});
