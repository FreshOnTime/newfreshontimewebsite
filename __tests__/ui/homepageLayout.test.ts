import { readFileSync } from 'node:fs';
import { MARKET_NAVIGATION } from '@/lib/navigation';
import nextConfig from '@/next.config';

it('opens discovery and maker publishing from the homepage', () => {
  const html = readFileSync('app/page.tsx', 'utf8');
  expect(html).toContain('action="/makers"');
  expect(html).toContain('href="/join"');
  expect(html).toContain('supplier: publicMakerWhere');
  expect(MARKET_NAVIGATION.map(link => link.href)).toEqual(['/makers','/stories','/saved','/about']);
});

it('maps previous public commerce and procurement links to maker workflows', async () => {
  const redirects = await nextConfig.redirects!();
  for (const [source,destination] of [['/products/:path*','/makers'],['/checkout','/makers'],['/b2b','/join'],['/supply','/join']]) {
    expect(redirects).toContainEqual(expect.objectContaining({source,destination}));
  }
  expect(redirects.some(rule => rule.source === '/orders/:path*')).toBe(false);
});
