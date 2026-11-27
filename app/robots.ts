import type { MetadataRoute } from 'next';
import { SITE_URL, absoluteUrl } from '@/lib/config/site';

const PRIVATE_PATHS = [
  '/api/',
  '/admin',
  '/dashboard',
  '/auth/',
  '/checkout',
  '/profile',
  '/orders',
  '/wishlist',
  '/bags',
  '/for-you',
  '/supplier',
  '/saved',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Explicitly allow search/answer crawlers to discover public content while
      // keeping account, checkout and admin surfaces out of crawl indexes.
      { userAgent: ['Googlebot', 'Bingbot', 'OAI-SearchBot', 'ChatGPT-User', 'Claude-SearchBot', 'Claude-User', 'PerplexityBot'], allow: '/', disallow: PRIVATE_PATHS },
      { userAgent: '*', allow: '/', disallow: PRIVATE_PATHS },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
    host: SITE_URL,
  };
}
