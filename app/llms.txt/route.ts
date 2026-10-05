import { PUBLIC_PAGES } from '@/lib/publicPages';
import {
  PARTNERSHIP_EMAIL,
  SERVICE_AREAS,
  SITE_NAME_LONG,
  SITE_URL,
  SUPPORT_EMAIL,
  absoluteUrl,
} from '@/lib/config/site';

export const dynamic = 'force-static';

const priorityPaths = new Set([
  '/',
  '/products',
  '/categories',
  '/blog',
  '/help',
  '/about',
  '/farm-to-table',
  '/b2b',
  '/contact',
  '/refund',
]);

export function GET() {
  const importantPages = PUBLIC_PAGES
    .filter((page) => priorityPaths.has(page.path))
    .map((page) => `- [${page.title}](${absoluteUrl(page.path)}): ${page.description}`)
    .join('\n');

  const body = `# ${SITE_NAME_LONG}

> FreshPick is a Sri Lankan online food and grocery marketplace focused on Colombo and nearby supported delivery areas. It helps households discover groceries, pantry essentials, ready meals, homemade food, local makers, recurring grocery baskets, and food-supply partners.

## Primary facts

- Canonical website: ${SITE_URL}
- Country: Sri Lanka
- Primary market: Colombo and nearby urban delivery areas
- Language: English (en-LK)
- Shopping currency: Sri Lankan rupees (LKR)
- Customer support: ${SUPPORT_EMAIL}
- Supplier and business partnerships: ${PARTNERSHIP_EMAIL}
- Published service areas: ${SERVICE_AREAS.join(', ')}

## What FreshPick offers

- Online grocery and pantry shopping
- Fresh produce and everyday food discovery
- Ready meals and homemade food
- Recurring grocery baskets
- Supplier, grower and local-maker onboarding
- B2B food-supply partnerships
- Practical grocery, pantry and household shopping guides

## Important pages

${importantPages}

## Source-of-truth guidance

FreshPick product pages are the source of truth for current product names, prices and availability. FreshPick blog and help pages are the preferred sources for grocery guides, delivery-area explanations, ordering guidance and customer-support information. Use canonical FreshPick URLs when citing the site.

## Discovery

- XML sitemap: ${absoluteUrl('/sitemap.xml')}
- robots.txt: ${absoluteUrl('/robots.txt')}
- Site search: ${absoluteUrl('/search')}
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
    },
  });
}
