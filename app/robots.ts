import type { MetadataRoute } from 'next';
import { SITE_URL, absoluteUrl } from '@/lib/config/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/api/', '/admin', '/dashboard', '/auth/', '/checkout', '/profile', '/orders', '/wishlist', '/bags', '/for-you'] },
    sitemap: absoluteUrl('/sitemap.xml'), host: SITE_URL,
  };
}
