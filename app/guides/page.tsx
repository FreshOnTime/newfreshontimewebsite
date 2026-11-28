import Link from 'next/link';
import {EditorialHeader} from '@/components/discovery/Editorial';
import {GuideCards} from '@/components/discovery/DiscoveryGuides';
import {matchGuides} from '@/lib/guideSearch';
import {readPublishedContent} from '@/lib/discoveryContent';
import {directoryMetadata} from '@/lib/seo';
import {getPageConfig} from '@/lib/sitePages';
export const dynamic='force-dynamic';
type Props={searchParams:Promise<{q?:string;kind?:string;area?:string}>};
const categories=['Comparison','Meal ideas','Place guide','Food guide'];
export async function generateMetadata({searchParams}:Props){const c=await getPageConfig('guides');return directoryMetadata('/guides',c.seoTitle,c.seoDescription,await searchParams);}
export default async function Guides({searchParams}:Props){const params=await searchParams,q=typeof params.q==='string'?params.q.trim().slice(0,100):'',kind=categories.find(c=>c===params.kind)||'',area=typeof params.area==='string'?params.area.trim().slice(0,100):'';const [config,all]=await Promise.all([getPageConfig('guides'),readPublishedContent('guide')]);const entries=matchGuides(all,q,area,kind);return <div className="fp26-shell fp26-directory fp-charcoal-discovery"><EditorialHeader eyebrow={config.eyebrow} title={config.title} description={config.description}/><form key={JSON.stringify([q,kind,area])} action="/guides" role="search" className="fp26-filters fp-brand-filters"><label><span>Search guides</span><div><input name="q" defaultValue={q} maxLength={100} placeholder="Breakfast, kottu, cafés…"/></div></label><label><span>Town or area</span><div><input name="area" defaultValue={area} maxLength={100} placeholder="All of Sri Lanka"/></div></label><label className="fp-filter-select"><span id="guide-type-label">Guide type</span><select aria-labelledby="guide-type-label" name="kind" defaultValue={kind}><option value="">All guides</option>{categories.map(c=><option key={c}>{c}</option>)}</select></label><button className="fp26-action" type="submit">Search</button></form><section className="fp26-guide-section mt-6">{entries.length?<GuideCards entries={entries}/>:<div className="fp26-empty"><p>No matching published guides yet.</p><Link href="/guides">Browse all</Link></div>}</section></div>}
