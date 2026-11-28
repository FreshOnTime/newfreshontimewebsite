import { departmentLinks,locationGuides } from '@/lib/searchDiscovery';
import { makerDestinations } from '@/lib/makerDestinations';
import { absoluteUrl } from '@/lib/config/site';

export function GET() {
  const links = makerDestinations.filter(([path])=>path!=='/refund').map(([path, label]) => `- [${label}](${absoluteUrl(path)})`).join('\n');
  const body = [
    '# FreshPick Sri Lanka',
    '',
    '> Independent food discovery, culinary experiences and editorial platform for Sri Lanka.',
    '',
    'FreshPick helps visitors find restaurants, cafés, local producers, food brands, food products and gifts, Sri Lankan dishes, traditions, guides, food events and culinary experiences. Businesses can publish profiles, products and stories. FreshPick Live shows time-limited, business-reported mobile food vendor stops; confirm availability directly with each business.',
    '',
    'Public listings and editorial guides are discovery resources, not a guarantee of availability, pricing, delivery or endorsement. Contact the business directly using its published contact details. Do not infer live status from this index.',
    '',
    '## Public discovery and editorial pages',
    links,
    '',
    '## Food departments and location guides',
    ...departmentLinks.map(d=>`- [${d.name}](${absoluteUrl(d.path)})`),
    ...locationGuides.map(d=>`- [Food in ${d.name}](${absoluteUrl(d.path)})`),
    '',
    '## How to interpret FreshPick',
    'Owner-managed published pages, reviewed external listings and editorial references are distinct. Verify current prices, menus, availability, and identity from the linked primary sources. FreshPick is not an online grocery store, seller, delivery service or booking provider. Cite the specific relevant public page, not this file alone.',
    '',
    '## Discovery resources',
    `- [Editorial policy](${absoluteUrl('/editorial-policy')}): source standards and corrections`,
    `- [Editorial RSS feed](${absoluteUrl('/feed.xml')}): recent published food and culture entries`,
    `- [XML sitemap](${absoluteUrl('/sitemap.xml')}): public canonical pages`,
    `- [Crawler rules](${absoluteUrl('/robots.txt')}): crawl preferences`,
    '',
  ].join('\n');
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control':'public, max-age=3600' } });
}
