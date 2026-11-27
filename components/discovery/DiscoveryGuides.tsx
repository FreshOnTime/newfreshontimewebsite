import Link from 'next/link';
import {readPublishedContent,contentPath} from '@/lib/discoveryContent';
import {SectionHeading} from './Editorial';
type Guide=Awaited<ReturnType<typeof readPublishedContent>>[number];
export function GuideCards({entries}:{entries:readonly Guide[]}){return <div className="fp-atlas-grid">{entries.map(g=><Link className="fp-atlas-card" key={g.slug} href={contentPath(g.kind,g.slug)}><p className="fp26-label">{g.category}</p><h3>{g.title}</h3><p>{g.summary}</p><span className="fp26-textlink">Read the guide</span></Link>)}</div>}
export async function GuideShelfFromCms({title}:{title:string}){const entries=await readPublishedContent('guide').catch(error=>{console.error('Guides unavailable',error);return []});return <section className="fp26-guide-section"><SectionHeading title={title} href="/guides" label="All food guides"/>{entries.length?<GuideCards entries={entries.slice(0,3)}/>:<p className="fp26-meta">Explore our food guides for comparisons, meal ideas and practical inspiration as they are published.</p>}</section>}
