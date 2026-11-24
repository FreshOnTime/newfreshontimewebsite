import Link from 'next/link';
import { makerDestinations } from '@/lib/makerDestinations';
export const metadata = { title: 'Site map' };
export default function SiteMap() {
  return <div className="fp-map editorial-wrap py-12"><h1 className="maker-headline">Site map.</h1><ul className="fp-map-links">{makerDestinations.map(([href,name]) => <li key={href}><Link className="block py-3 font-medium" href={href}>{name}</Link></li>)}</ul></div>;
}
