import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/services/mailService';

export const POST = async (req: NextRequest) => {
  // Only allow in non-production or when DEV_EMAIL_SECRET matches
  const devSecret = process.env.DEV_EMAIL_SECRET;
  const env = process.env.NODE_ENV || 'development';

  if (env === 'production' && (!devSecret || req.headers.get('x-dev-email-secret') !== devSecret)) {
    return NextResponse.json({ error: 'Not allowed' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const to = body?.to || process.env.SENDGRID_FROM_EMAIL;
    const subject = body?.subject || 'Test email from FreshOnTime';
    const html = body?.html || '<p>This is a test email.</p>';

    await sendEmail(to, subject, html, (body?.text || 'Test email'));

    return NextResponse.json({ message: 'Email queued (if SendGrid configured)' });
  } catch (e) {
    console.error('send-test-email error', e);
    return NextResponse.json({ error: 'Failed to send test email' }, { status: 500 });
  }
};
