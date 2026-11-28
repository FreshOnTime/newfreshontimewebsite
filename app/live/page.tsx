import Link from 'next/link';
import {EditorialHeader} from '@/components/discovery/Editorial';
import LiveDirectory from '@/components/discovery/LiveDirectory';
import {getPageConfig} from '@/lib/sitePages';
import {listLiveVendors} from '@/lib/liveVendorService';
import {directoryMetadata} from '@/lib/seo';
export const dynamic='force-dynamic';
type Props={searchParams:Promise<{q?:string;area?:string}>};
export async function generateMetadata({searchParams}:Props){const c=await getPageConfig('live');return directoryMetadata('/live',c.seoTitle,c.seoDescription,await searchParams);}
export default async function LivePage({searchParams}:Props){const [config,vendors,params]=await Promise.all([getPageConfig('live'),listLiveVendors().catch(error=>{console.error('Live directory unavailable',error);return null}),searchParams]);return <div className="fp26-shell fp-charcoal-discovery"><EditorialHeader eyebrow={config.eyebrow} title={config.title} description={config.description}/><p className="fp26-meta mb-4">Stops are reported by approved businesses, not continuously tracked. Confirm current availability directly.</p><LiveDirectory initial={vendors||[]} initialError={vendors===null} initialQuery={typeof params.q==='string'?params.q.slice(0,100):''} initialArea={typeof params.area==='string'?params.area.slice(0,100):''}/><section className="fp26-guide-section fp-green-highlight mt-6"><div><h2>Run a mobile food business?</h2><p>Publish your business profile and request Live access in Business Studio.</p></div><Link href="/dashboard" className="fp26-action">Open Business Studio</Link></section></div>}
