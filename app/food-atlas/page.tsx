import {EditorialHeader} from '@/components/discovery/Editorial';
import {DishCards} from '@/components/discovery/Hub';
import {getPublishedDishes} from '@/lib/discoveryContent';
import {matchDishes} from '@/lib/foodAtlas';
import {directoryMetadata} from '@/lib/seo';
import Link from 'next/link';
export const dynamic='force-dynamic';
type Props={searchParams:Promise<{q?:string|string[]}>};
export async function generateMetadata({searchParams}:Props){return directoryMetadata('/food-atlas','Sri Lankan Food Atlas','Explore Sri Lankan dishes, their variations and related food discoveries.',await searchParams);}
export default async function FoodAtlas({searchParams}:Props){const params=await searchParams;const q=typeof params.q==='string'?params.q.trim().slice(0,100):'';const entries=matchDishes(q,await getPublishedDishes());
return <div className="fp26-shell fp26-directory"><EditorialHeader eyebrow="Know your food" title="The Sri Lankan Food Atlas" description="Discover traditional dishes, learn what makes them distinctive and search published menus. An expanding island-wide editorial guide, not a restaurant rating. For local results, use dining search."/><Link className="fp26-textlink mb-3" href="/traditions">Explore food traditions</Link><form key={q} action="/food-atlas" role="search" className="fp26-filters fp-atlas-search"><label><span>Find a dish</span><div><input name="q" defaultValue={q} placeholder="Kottu, appa, kiribath…" maxLength={100}/></div></label><button className="fp26-action" type="submit">Search</button></form><section className="fp26-guide-section mt-6">{entries.length?<DishCards entries={entries}/>:<div className="fp26-empty"><div><h2>No matching dishes yet.</h2><p>Try a different name or browse the Atlas.</p></div><Link href="/food-atlas" className="fp26-textlink">See all dishes</Link></div>}</section></div>}
