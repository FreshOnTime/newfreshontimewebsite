import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import Supplier from '@/lib/models/Supplier';
import User from '@/lib/models/User';
import { authService } from '@/lib/services/authService';

interface SupplierPayload {
  companyName: string;
  contactName: string;
  email?: string;
  phone?: string;
  address?: {
    addressLine1?: string;
    city?: string;
    province?: string;
    postalCode?: string;
    country?: string;
  };
  productListCsv?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as SupplierPayload;
    console.log('Supplier register payload:', body);

    await connectDB();

    // Basic validation
    if (!body.companyName || !body.contactName || !body.phone) {
      return NextResponse.json({ error: 'companyName, contactName and phone are required' }, { status: 400 });
    }

    // Create supplier document
    const supplier = new Supplier({
      name: body.companyName,
      contactName: body.contactName,
      email: body.email || undefined,
      phone: body.phone,
      address: {
        street: body.address?.addressLine1 || '',
        city: body.address?.city || '',
        state: body.address?.province || '',
        zipCode: body.address?.postalCode || '',
        country: body.address?.country || '',
      },
      paymentTerms: 'net-30',
    });

    const saved = await supplier.save();

    // If user is authenticated, link supplier to user account and set role
    try {
      const authHeader = request.headers.get('authorization') || undefined;
      let user = null;

      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.replace(/^Bearer\s+/, '');
        user = await authService.getUserByToken(token);
      } else {
        // Try cookies
        const cookieToken = request.cookies.get('accessToken')?.value;
        if (cookieToken) {
          user = await authService.getUserByToken(cookieToken);
        }
      }

      if (user) {
        await User.updateOne({ userId: user.userId }, { $set: { supplierId: saved._id, role: 'supplier' } });
      }
    } catch (linkErr) {
      console.warn('Failed to link supplier to user:', linkErr);
    }

    return NextResponse.json({ message: 'Supplier created', supplier: saved }, { status: 201 });
  } catch (e) {
    console.error('Supplier register error', e);
    return NextResponse.json({ error: 'Failed to register supplier' }, { status: 500 });
  }
}
