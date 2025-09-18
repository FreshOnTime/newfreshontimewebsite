import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import Supplier, { ISupplier } from '@/lib/models/Supplier';
import SupplierUpload from '@/lib/models/SupplierUpload';
import User, { IUser } from '@/lib/models/User';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { sendEmail } from '@/lib/services/mailService';
import { requireAuth } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

// Note: Next API routes with multipart parsing require custom handling.
// Here we rely on a simple stream-based save for small files from the client.

export const POST = requireAuth(async (request: NextRequest & { user?: { mongoId?: string; userId?: string } }) => {
  try {
    await connectDB();

  // Determine supplierId from the authenticated user record
  const authUser = request.user;
  if (!authUser) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  // Debug: log auth info to diagnose supplier linkage issues
  console.log('[DEBUG] /api/suppliers/upload - authUser:', authUser);

  const userDoc = authUser.mongoId
    ? await User.findById(authUser.mongoId).lean() as Partial<IUser> | null
    : await User.findOne({ userId: authUser.userId }).lean() as Partial<IUser> | null;

  console.log('[DEBUG] /api/suppliers/upload - userDoc _id:', userDoc?._id?.toString?.(), ' userDoc.supplierId:', userDoc?.supplierId?.toString?.());

  const supplierIdFromUser = userDoc?.supplierId?.toString?.() || null;
  console.log('[DEBUG] /api/suppliers/upload - supplierIdFromUser:', supplierIdFromUser);

  // Fallback: if the User record doesn't have supplierId, try to auto-link by email or phone
  let resolvedSupplierId = supplierIdFromUser;
  if (!resolvedSupplierId) {
    try {
      const maybeEmail = userDoc?.email as string | undefined;
      const maybePhone = userDoc?.phoneNumber as string | undefined;
      console.log('[DEBUG] /api/suppliers/upload - attempting fallback link using email/phone:', maybeEmail, maybePhone);
      let foundSupplier = null as Partial<ISupplier> | null;
      if (maybeEmail) {
        foundSupplier = await Supplier.findOne({ email: maybeEmail }).lean() as Partial<ISupplier> | null;
      }
      if (!foundSupplier && maybePhone) {
        foundSupplier = await Supplier.findOne({ phone: maybePhone }).lean() as Partial<ISupplier> | null;
      }

      if (foundSupplier && foundSupplier._id) {
        resolvedSupplierId = foundSupplier._id.toString();
        // Persist the link on the user record for future requests
        try {
          await User.updateOne({ _id: userDoc?._id }, { $set: { supplierId: foundSupplier._id, role: 'supplier' } });
          console.log('[DEBUG] /api/suppliers/upload - auto-linked user to supplier:', resolvedSupplierId);
        } catch (linkErr) {
          console.warn('[WARN] /api/suppliers/upload - failed to persist auto-link on user:', linkErr);
        }
      }
    } catch (e) {
      console.warn('[WARN] /api/suppliers/upload - fallback link attempt failed', e);
    }
  }

  if (!resolvedSupplierId) return NextResponse.json({ error: 'User is not linked to a supplier account' }, { status: 403 });

    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json({ error: 'Content-Type must be multipart/form-data' }, { status: 400 });
    }

    // Use the Request.formData() browser API available in Next edge/node runtimes
    const form = await request.formData();
    const file = form.get('file') as unknown as File | null;
    if (!file) return NextResponse.json({ error: 'File is required' }, { status: 400 });

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'supplier-uploads');
    await fs.promises.mkdir(uploadsDir, { recursive: true });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2,8)}-${file.name}`;
    const destPath = path.join(uploadsDir, filename);
    await fs.promises.writeFile(destPath, buffer);

    // parse preview depending on file type
  let previewRows: unknown[] = [];
    try {
      if (file.name.endsWith('.csv') || file.type === 'text/csv') {
        const text = buffer.toString('utf8');
        const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
        previewRows = parsed.data as unknown[];
      } else {
        const wb = XLSX.read(buffer, { type: 'buffer' });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        previewRows = XLSX.utils.sheet_to_json(sheet, { defval: '' }) as unknown[];
      }
    } catch (e) {
      console.warn('Failed to parse preview', e);
      previewRows = [];
    }

    // attempt to include supplier's business name for easier admin display
    let supplierName: string | null = null;
    let supplierCompany: string | null = null;
    let supplierEmail: string | null = null;
    let supplierPhone: string | null = null;
    let supplierContactName: string | null = null;
    let supplierStatus: string | null = null;
    try {
      const finalSupplierId = resolvedSupplierId;
      const s = finalSupplierId ? await Supplier.findById(finalSupplierId).lean() as Partial<ISupplier> | null : null;
      supplierName = s?.name || s?.companyName || null;
      supplierCompany = s?.companyName || s?.name || null;
      supplierEmail = s?.email || null;
      supplierPhone = s?.phone || null;
      supplierContactName = s?.contactName || null;
      supplierStatus = s?.status || null;
    } catch {
      supplierName = null;
      supplierCompany = null;
      supplierEmail = null;
      supplierPhone = null;
      supplierContactName = null;
      supplierStatus = null;
    }

    const uploadDoc = await SupplierUpload.create({
      supplierId: resolvedSupplierId,
      supplierName,
      supplierCompany,
      supplierEmail,
      supplierPhone,
      supplierContactName,
      supplierStatus,
      filename,
      originalName: file.name,
      mimeType: file.type,
      size: buffer.length,
      path: `/uploads/supplier-uploads/${filename}`,
      preview: previewRows.slice(0, 20)
    });

    // Notify admin(s)
    try {
      const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
      if (adminEmail) {
        const html = `<p>Supplier uploaded product file: <strong>${file.name}</strong></p><p>Preview rows: ${JSON.stringify(previewRows.slice(0,3))}</p><p><a href="${process.env.FRONTEND_URL}/admin">Open admin dashboard</a></p>`;
        sendEmail(adminEmail, 'Supplier Product Upload', html).catch(err => console.error('admin notification error', err));
      }
    } catch (e) {
      console.warn('Notify admin error', e);
    }

    return NextResponse.json({ success: true, upload: uploadDoc }, { status: 201 });
  } catch (error) {
    console.error('Supplier upload error', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
});
