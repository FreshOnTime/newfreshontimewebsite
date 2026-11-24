import Link from 'next/link';
import { makerDestinations } from '@/lib/makerDestinations';
export const metadata = { title: 'Site map' };
export default function SiteMap() {
  return <div className="editorial-wrap max-w-4xl py-12"><h1 className="maker-headline">Site map.</h1><ul className="my-8 divide-y divide-border">{makerDestinations.map(([href,name]) => <li key={href}><Link className="block py-3 font-medium" href={href}>{name}</Link></li>)}</ul></div>;
}
