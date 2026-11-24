import Link from 'next/link';
import { PageBand } from '@/components/makers/Edition';
export const metadata = { title: 'FreshPick help' };
export default function Help() {
  const answers = [
    ['How can I reserve an item?', 'Open its maker page and use the WhatsApp button on a batch or made-to-order item. The maker confirms availability and any reservation.'],
    ['Who handles delivery and payment?', 'Each maker lists their collection or delivery options. Agree the details directly before placing an order.'],
    ['Why did a batch disappear?', 'A batch closes when its preorder cutoff passes or the maker marks it sold out. The item page stays available for future batches.'],
    ['Where are my saved picks?', 'Open Saved in the navigation on the same browser and device where you bookmarked them.'],
    ['How do I publish?', 'Choose Become a maker. After your profile is approved, Maker Studio lets you publish items, batches and stories.'],
  ];
  return <><PageBand title="How can we help?" intro="Answers about makers, enquiries and your FreshPick account."/><div className="fp-help editorial-wrap"><div className="my-8 divide-y divide-border">{answers.map(([q,a]) => <details key={q} className="py-4"><summary className="cursor-pointer font-serif text-xl">{q}</summary><p className="py-3 leading-7">{a}</p></details>)}</div><Link href="/contact" className="maker-button">Contact the team</Link></div></>;
}
