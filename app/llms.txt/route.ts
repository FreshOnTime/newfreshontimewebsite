import { makerDestinations } from '@/lib/makerDestinations';
import { absoluteUrl } from '@/lib/config/site';
export function GET() {
  const links = makerDestinations.map(([path, label]) => `- [${label}](${absoluteUrl(path)})`).join('\n');
  return new Response(`# FreshPick Sri Lanka\n\nDiscover independent food makers, items, current batches and stories. Contact each maker directly on WhatsApp for payment and fulfilment.\n\n${links}\n`, {headers:{'Content-Type':'text/plain; charset=utf-8'}});
}
