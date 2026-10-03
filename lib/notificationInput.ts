import { z } from 'zod';

/** Notifications only navigate within this storefront. Also protects legacy rows. */
export function safeNotificationLink(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const path = value.trim();
  if (!path || path.length > 1000 || !path.startsWith('/') || path.startsWith('//') || /[\\\s\u0000-\u001f\u007f]/.test(path)) return null;
  try {
    // Reject encoded backslashes/control characters and protocol-relative paths.
    const decoded = decodeURIComponent(path);
    if (decoded.startsWith('//') || /[\\\s\u0000-\u001f\u007f]/.test(decoded)) return null;
    const url = new URL(path, 'https://freshpick.lk');
    return url.origin === 'https://freshpick.lk' ? path : null;
  } catch { return null; }
}
export const notificationInput = z.object({
  title: z.string().trim().min(1).max(200),
  message: z.string().trim().min(1).max(5000),
  type: z.enum(['info', 'success', 'warning', 'error', 'promo']).default('info'),
  targetUserId: z.string().trim().min(1).max(100).default('all'),
  link: z.string().trim().max(1000).optional().transform(value => value || null).refine(value => value === null || safeNotificationLink(value) !== null, 'Use a storefront path such as /products'),
  submissionId: z.string().uuid().optional(),
});
