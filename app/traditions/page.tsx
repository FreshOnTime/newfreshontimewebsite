import {getPageConfig} from '@/lib/sitePages';
import Link from 'next/link';
import {EditorialHeader} from '@/components/discovery/Editorial';
import {readPublishedContent,contentPath} from '@/lib/discoveryContent';
import {pageMetadata} from '@/lib/seo';
export const dynamic='force-dynamic';
export async function generateMetadata(){const c=await getPageConfig('traditions');return pageMetadata({path:'/traditions',title:c.seoTitle,description:c.seoDescription});}
export default async function Traditions(){const entries=await readPublishedContent('tradition');const c=await getPageConfig('traditions');return <div className="fp26-shell"><EditorialHeader eyebrow={c.eyebrow} title={c.title} description={c.description}/><section className="fp26-guide-section">{entries.length?<div className="fp-atlas-grid">{entries.map(t=><Link key={t.slug} className="fp-atlas-card" href={contentPath(t.kind,t.slug)}><p className="fp26-label">{t.category}</p><h3>{t.title}</h3><p>{t.summary}</p><span className="fp26-textlink">Read the story</span></Link>)}</div>:<p>New food traditions will appear here when published.</p>}</section><Link href="/food-atlas" className="fp26-action">Explore the Food Atlas</Link></div>}
