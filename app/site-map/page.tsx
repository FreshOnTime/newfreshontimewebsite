import Link from 'next/link';
import { makerDestinations } from '@/lib/makerDestinations';
import {departmentLinks,locationGuides} from '@/lib/searchDiscovery';
import {pageMetadata} from '@/lib/seo';
export const metadata=pageMetadata({path:'/site-map',title:'FreshPick site map',description:'Browse FreshPick’s food departments, location guides, food culture, journal and business discovery pages.'});
export default function SiteMap() {
  return <div className="fp-map editorial-wrap py-12"><h1 className="maker-headline">Site map.</h1><ul className="fp-map-links">{[...makerDestinations,...departmentLinks.map(d=>[d.path,d.name] as const),...locationGuides.map(d=>[d.path,'Food in '+d.name] as const)].map(([href,name]) => <li key={href}><Link className="block py-3 font-medium" href={href}>{name}</Link></li>)}</ul></div>;
}
