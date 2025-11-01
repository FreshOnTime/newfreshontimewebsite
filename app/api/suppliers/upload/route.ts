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

// Configure API route to handle larger payloads (10MB for Excel files)
export const maxDuration = 60; // 60 seconds timeout
export const dynamic = 'force-dynamic';

// Note: Next API routes with multipart parsing require custom handling.
// Here we rely on a simple stream-based save for small files from the client.

export const POST = requireAuth(async (request: NextRequest & { user?: { mongoId?: string; userId?: string } }) => {
  try {
    await connectDB();

    // Determine supplierId from the authenticated user record
    const authUser = request.user;
    if (!authUser) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

    const userDoc = (authUser.mongoId
      ? await User.findById(authUser.mongoId).lean()
      : await User.findOne({ userId: authUser.userId }).lean()) as Partial<IUser> | null;

    let resolvedSupplierId = userDoc?.supplierId?.toString?.() || null;

    // Fallback: if the User record doesn't have supplierId, try to auto-link by email or phone
    if (!resolvedSupplierId) {
      try {
        const maybeEmail = userDoc?.email as string | undefined;
        const maybePhone = userDoc?.phoneNumber as string | undefined;
        let foundSupplier: Partial<ISupplier> | null = null;

        if (maybeEmail) {
          foundSupplier = (await Supplier.findOne({ email: maybeEmail }).lean()) as Partial<ISupplier> | null;
        }
        if (!foundSupplier && maybePhone) {
          foundSupplier = (await Supplier.findOne({ phone: maybePhone }).lean()) as Partial<ISupplier> | null;
        }

        if (foundSupplier && foundSupplier._id) {
          resolvedSupplierId = foundSupplier._id.toString();
          // Persist the link on the user record for future requests
          try {
            await User.updateOne(
              { _id: userDoc?._id },
              { $set: { supplierId: foundSupplier._id, role: 'supplier' } }
            );
          } catch (linkErr) {
            console.warn('[WARN] /api/suppliers/upload - failed to persist auto-link on user:', linkErr);
          }
        }
      } catch (e) {
        console.warn('[WARN] /api/suppliers/upload - fallback link attempt failed', e);
      }
    }

    if (!resolvedSupplierId) {
      return NextResponse.json({ error: 'User is not linked to a supplier account' }, { status: 403 });
    }

    // Support two upload modes:
    // 1) JSON body containing { fileName, fileData } where fileData is base64 (recommended for all runtimes)
    // 2) multipart/form-data with a `file` field (legacy, may not work in all environments)
    
    const contentType = request.headers.get('content-type') || '';
    let file: File | (Blob & { name?: string; type?: string }) | null = null;

    // Try JSON first (recommended path)
    if (contentType.includes('application/json')) {
      try {
        console.log('[DEBUG] /api/suppliers/upload - Parsing JSON body');
        const bodyJson = await request.json();
        const maybeData = bodyJson?.fileData || bodyJson?.data || bodyJson?.file;
        const maybeName = bodyJson?.fileName || bodyJson?.originalName || bodyJson?.name;
        const maybeMimeType = bodyJson?.mimeType || bodyJson?.type || '';
        
        console.log('[DEBUG] /api/suppliers/upload - File name:', maybeName, 'has data:', !!maybeData);
        
        if (typeof maybeData === 'string' && maybeData.length > 0) {
          // Expect a base64 string (possibly with data:<mime>;base64,...)
          const base64 = maybeData.replace(/^data:.*;base64,/, '');
          const buf = Buffer.from(base64, 'base64');
          
          console.log('[DEBUG] /api/suppliers/upload - Decoded buffer size:', buf.length);
          
          // Create a file-like object that works in Node.js (no Blob constructor in Node)
          // Instead, create an object with the properties we need
          file = {
            name: typeof maybeName === 'string' && maybeName.trim() ? maybeName.trim() : `upload-${Date.now()}`,
            type: maybeMimeType,
            buffer: buf, // Store the buffer directly
            arrayBuffer: async () => buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
          } as unknown as Blob & { name?: string; type?: string; buffer?: Buffer };
          
          console.log('[DEBUG] /api/suppliers/upload - File object created:', file.name, file.type);
        }
      } catch (e) {
        console.error('[ERROR] /api/suppliers/upload - parsing JSON base64 failed:', e);
        throw e; // Re-throw to see the actual error
      }
    }
    // Fallback: try multipart/form-data if JSON didn't work
    else if (contentType.includes('multipart/form-data')) {
      try {
        const reqWithForm = request as NextRequest & { formData?: () => Promise<FormData> };
        if (typeof reqWithForm.formData === 'function') {
          const form = await reqWithForm.formData();
          file = (form.get('file') as unknown) as File | (Blob & { name?: string; type?: string }) | null;
        } else {
          console.warn('[WARN] /api/suppliers/upload - formData() not available in this runtime');
        }
      } catch (err) {
        console.warn('[WARN] /api/suppliers/upload - formData() parsing failed', err);
      }
    }

    if (!file) {
      console.error('[ERROR] /api/suppliers/upload - No usable file found in request. content-type:', request.headers.get('content-type'));
      return NextResponse.json({ error: 'File is required (field name should be "file"). If your runtime does not support multipart/form-data, POST JSON with { fileName, fileData (base64) }.' }, { status: 400 });
    }

    console.log('[DEBUG] /api/suppliers/upload - File object type check:', typeof file);

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'supplier-uploads');
    
    // Ensure upload directory exists with proper error handling
    try {
      await fs.promises.mkdir(uploadsDir, { recursive: true });
      // Verify directory is writable
      await fs.promises.access(uploadsDir, fs.constants.W_OK);
      console.log('[INFO] /api/suppliers/upload - Upload directory ready:', uploadsDir);
    } catch (dirErr) {
      console.error('[ERROR] /api/suppliers/upload - Failed to create/access upload directory:', dirErr);
      return NextResponse.json({ 
        error: 'Upload directory not accessible. Please contact administrator.',
        details: process.env.NODE_ENV === 'development' ? String(dirErr) : undefined 
      }, { status: 500 });
    }

    // Get buffer - either from our custom object or from Blob's arrayBuffer
    let buffer: Buffer;
    const fileWithBuffer = file as { buffer?: Buffer };
    if (fileWithBuffer.buffer && Buffer.isBuffer(fileWithBuffer.buffer)) {
      console.log('[DEBUG] /api/suppliers/upload - Using direct buffer');
      buffer = fileWithBuffer.buffer;
    } else if (typeof (file as Blob).arrayBuffer === 'function') {
      console.log('[DEBUG] /api/suppliers/upload - Using arrayBuffer method');
      const arrayBuffer = await (file as Blob).arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    } else {
      console.error('[ERROR] /api/suppliers/upload - File object has no buffer or arrayBuffer method');
      return NextResponse.json({ error: 'Invalid file object' }, { status: 400 });
    }

    const fileLike = file as File | (Blob & { name?: string; type?: string });
    const rawOriginalName = typeof fileLike?.name === 'string' && fileLike.name.trim()
      ? fileLike.name.trim()
      : `upload-${Date.now()}`;
    const originalName = path.basename(rawOriginalName);
    const safeOriginalName = originalName.replace(/[^a-zA-Z0-9.\-]+/g, '_');
    const mimeType = typeof fileLike?.type === 'string' && fileLike.type.trim()
      ? fileLike.type
      : '';
    
    // Detect MIME type from extension if not provided
    let detectedMimeType = mimeType;
    if (!detectedMimeType) {
      const lowerName = safeOriginalName.toLowerCase();
      if (lowerName.endsWith('.csv')) {
        detectedMimeType = 'text/csv';
      } else if (lowerName.endsWith('.xlsx')) {
        detectedMimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      } else if (lowerName.endsWith('.xls')) {
        detectedMimeType = 'application/vnd.ms-excel';
      } else {
        detectedMimeType = 'application/octet-stream';
      }
    }
    
    console.log('[INFO] /api/suppliers/upload - File:', originalName, 'MIME:', detectedMimeType, 'Size:', buffer.length);
    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const filename = `${uniqueSuffix}-${safeOriginalName}`;
    const destPath = path.join(uploadsDir, filename);
    
    try {
      await fs.promises.writeFile(destPath, buffer);
      console.log('[DEBUG] /api/suppliers/upload - File written to:', destPath);
    } catch (writeErr) {
      console.error('[ERROR] /api/suppliers/upload - Failed to write file:', writeErr);
      throw new Error('Failed to write file to disk: ' + (writeErr instanceof Error ? writeErr.message : String(writeErr)));
    }

    // parse preview depending on file type
    let previewRows: unknown[] = [];
    try {
      const lowerName = safeOriginalName.toLowerCase();
      const isCsv = detectedMimeType === 'text/csv' || lowerName.endsWith('.csv');
      const isExcel = detectedMimeType.includes('spreadsheet') || detectedMimeType.includes('excel') || lowerName.endsWith('.xlsx') || lowerName.endsWith('.xls');
      
      console.log('[INFO] /api/suppliers/upload - Parsing preview. isCsv:', isCsv, 'isExcel:', isExcel);
      
      if (isCsv) {
        const text = buffer.toString('utf8');
        const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
        previewRows = parsed.data as unknown[];
        console.log('[INFO] /api/suppliers/upload - CSV parsed, rows:', previewRows.length);
      } else if (isExcel) {
        const wb = XLSX.read(buffer, { type: 'buffer' });
        if (!wb.SheetNames || wb.SheetNames.length === 0) {
          console.warn('[WARN] /api/suppliers/upload - Excel file has no sheets');
          previewRows = [];
        } else {
          const sheet = wb.Sheets[wb.SheetNames[0]];
          previewRows = XLSX.utils.sheet_to_json(sheet, { defval: '' }) as unknown[];
          console.log('[INFO] /api/suppliers/upload - Excel parsed, rows:', previewRows.length);
        }
      } else {
        console.warn('[WARN] /api/suppliers/upload - Unknown file type, skipping preview');
        previewRows = [];
      }
    } catch (e) {
      console.error('[ERROR] /api/suppliers/upload - Failed to parse preview:', e);
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
      const s = finalSupplierId
        ? ((await Supplier.findById(finalSupplierId).lean()) as (Partial<ISupplier> & { companyName?: string | null }) | null)
        : null;
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

  let uploadDoc: unknown = null;
    try {
      uploadDoc = await SupplierUpload.create({
        supplierId: resolvedSupplierId,
        supplierName,
        supplierCompany,
        supplierEmail,
        supplierPhone,
        supplierContactName,
        supplierStatus,
        filename,
        originalName,
        mimeType: detectedMimeType,
        size: buffer.length,
        path: `/uploads/supplier-uploads/${filename}`,
        preview: previewRows.slice(0, 20)
      });
    } catch (dbErr) {
      console.error('[ERROR] /api/suppliers/upload - Failed to create DB record:', dbErr);
      const msg = dbErr instanceof Error ? dbErr.message : String(dbErr);
      return NextResponse.json({ error: 'Failed to save upload record', details: process.env.NODE_ENV === 'development' ? msg : undefined }, { status: 500 });
    }

    // Notify admin(s)
    try {
      const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
      if (adminEmail) {
        const html = `<p>Supplier uploaded product file: <strong>${originalName}</strong></p><p>Preview rows: ${JSON.stringify(
          previewRows.slice(0, 3)
        )}</p><p><a href="${process.env.FRONTEND_URL}/admin">Open admin dashboard</a></p>`;
        sendEmail(adminEmail, 'Supplier Product Upload', html).catch(err => console.error('admin notification error', err));
      }
    } catch (e) {
      console.warn('Notify admin error', e);
    }

    try {
      console.log('[INFO] /api/suppliers/upload - Upload successful, doc:', JSON.stringify(uploadDoc));
    } catch {
      console.log('[INFO] /api/suppliers/upload - Upload successful (could not stringify uploadDoc)');
    }
    return NextResponse.json({ success: true, upload: uploadDoc }, { status: 201 });
  } catch (error) {
    console.error('[ERROR] /api/suppliers/upload - Upload failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to upload file';
    return NextResponse.json({ 
      error: 'Failed to upload file', 
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined 
    }, { status: 500 });
  }
});
