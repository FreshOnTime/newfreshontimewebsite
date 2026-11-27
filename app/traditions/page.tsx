import Link from 'next/link';
import {EditorialHeader} from '@/components/discovery/Editorial';
import {readPublishedContent,contentPath} from '@/lib/discoveryContent';
import {pageMetadata} from '@/lib/seo';
export const dynamic='force-dynamic';
export const metadata=pageMetadata({path:'/traditions',title:'Sri Lankan food traditions & culture',description:'Explore the food customs, celebrations and stories behind Sri Lankan dishes.'});
export default async function Traditions(){const entries=await readPublishedContent('tradition');return <div className="fp26-shell"><EditorialHeader eyebrow="Food & culture" title="The traditions behind the food" description="Discover the stories, celebrations and customs that shape Sri Lankan food. Read about different communities and explore related dishes."/><section className="fp26-guide-section">{entries.length?<div className="fp-atlas-grid">{entries.map(t=><Link key={t.slug} className="fp-atlas-card" href={contentPath(t.kind,t.slug)}><p className="fp26-label">{t.category}</p><h3>{t.title}</h3><p>{t.summary}</p><span className="fp26-textlink">Read the story</span></Link>)}</div>:<p>New food traditions will appear here when published.</p>}</section><Link href="/food-atlas" className="fp26-action">Explore the Food Atlas</Link></div>}
