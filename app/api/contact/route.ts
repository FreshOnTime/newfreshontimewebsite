import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const name = String(data.name || '');
    const email = String(data.email || '');
    const message = String(data.message || '');
    const type = String(data.type || 'other');
    const subject = String(data.subject || '');
    const priority = String(data.priority || 'normal');
    const orderId = String(data.orderId || '');

    // Basic validation
    if (!email || !message) {
      return NextResponse.json({ ok: false, error: 'Missing fields' }, { status: 400 });
    }

  // TODO: persist to DB or send email. For now, log to server console.
  console.log('[contact] new message', {
      name,
      email,
      type,
      subject,
      priority,
      orderId,
      message,
      receivedAt: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Contact API error', err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
