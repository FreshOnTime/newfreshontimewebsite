import {DepartmentMenu} from '@/components/discovery/DepartmentMenu';
import {EditorialHeader} from '@/components/discovery/Editorial';
import Link from 'next/link';
import {collectionJsonLd,departmentLinks} from '@/lib/searchDiscovery';
import {pageMetadata,serializeJsonLd} from '@/lib/seo';
export const metadata=pageMetadata({path:'/explore',title:'Explore the world of food in Sri Lanka',description:'Discover restaurants, cafés, bakeries, caterers, fresh produce, local food brands, makers and gifts in Sri Lanka.'});
export default function Explore(){return <div className="fp26-shell"><script type="application/ld+json" dangerouslySetInnerHTML={{__html:serializeJsonLd(collectionJsonLd("/explore","Explore food in Sri Lanka","Discover Sri Lankan food departments.",departmentLinks))}}/><EditorialHeader eyebrow="Discover Sri Lanka" title="A world of food to explore." description="Choose a department, find businesses and offerings, and learn more about the people behind the food."/><DepartmentMenu title="Find your next favourite"/><section className="fp26-guide-section"><h2>Explore by location</h2><div className="fp26-directory-tools"><Link href="/locations/colombo">Food, cafés and restaurants in Colombo</Link></div></section></div>}
