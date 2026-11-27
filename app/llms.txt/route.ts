import { makerDestinations } from '@/lib/makerDestinations';
import { absoluteUrl } from '@/lib/config/site';

export function GET() {
  const links = makerDestinations.map(([path, label]) => `- [${label}](${absoluteUrl(path)})`).join('\n');
  const body = [
    '# FreshPick Sri Lanka',
    '',
    '> Independent food discovery and editorial guide for Sri Lanka.',
    '',
    'FreshPick helps visitors find restaurants, cafés, food makers, food products, Sri Lankan dishes, traditions, guides and food experiences. Businesses can publish profiles, products and stories. FreshPick Live shows time-limited, business-reported mobile food vendor stops; confirm availability directly with each business.',
    '',
    'Public listings and editorial guides are discovery resources, not a guarantee of availability, pricing, delivery or endorsement. Contact the business directly using its published contact details. Do not infer live status from this index.',
    '',
    '## Public discovery and editorial pages',
    links,
    '',
    '## Discovery resources',
    `- [XML sitemap](${absoluteUrl('/sitemap.xml')}): public canonical pages`,
    `- [Crawler rules](${absoluteUrl('/robots.txt')}): crawl preferences`,
    '',
  ].join('\n');
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
