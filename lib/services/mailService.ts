const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || "no-reply@example.com";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

let sendgrid: any = null;
let sendgridEnabled = false;

async function initSendGrid() {
  if (sendgrid || !process.env.SENDGRID_API_KEY) return;
  try {
    // dynamically import to avoid static bundling by Next's compiler
    const sg = await import('@sendgrid/mail');
    sendgrid = (sg && (sg.default || sg)) as any;
    sendgrid.setApiKey(process.env.SENDGRID_API_KEY);
    sendgridEnabled = true;
  } catch (e) {
    console.warn('Failed to initialize SendGrid:', e instanceof Error ? e.message : e);
    sendgrid = null;
    sendgridEnabled = false;
  }
}

export async function sendEmail(to: string, subject: string, html: string, text?: string) {
  await initSendGrid();
  if (!sendgridEnabled || !sendgrid) {
    console.warn('SendGrid not configured — skipping sendEmail to:', to);
    return;
  }

  const msg = {
    to,
    from: FROM_EMAIL,
    subject,
    text: text || undefined,
    html,
  };

  return sendgrid.send(msg as any);
}

export async function sendVerificationEmail(email: string, token: string) {
  const link = `${FRONTEND_URL}/auth/verify?token=${encodeURIComponent(token)}`;
  const html = `<p>Welcome — please verify your email by clicking <a href="${link}">this link</a>.</p>`;
  return sendEmail(email, 'Verify your account', html, `Verify your account: ${link}`);
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const link = `${FRONTEND_URL}/auth/reset-password?token=${encodeURIComponent(token)}`;
  const html = `<p>We received a request to reset your password. Click <a href="${link}">here</a> to reset it. If you didn't request this, ignore this email.</p>`;
  return sendEmail(email, 'Reset your password', html, `Reset your password: ${link}`);
}

export async function sendOrderEmail(to: string, order: { _id?: string; total?: number }) {
  const html = `<p>Thank you for your order <strong>#${order._id}</strong>.</p><p>Total: ${order.total}</p>`;
  return sendEmail(to, `Order Confirmation #${order._id}`, html, `Order #${order._id} placed.`);
}
