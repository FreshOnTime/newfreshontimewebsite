import BusinessMedia from '@/components/makers/BusinessMedia';
import {readArticleCover} from '@/lib/businessMedia';
import {businessArticleTopics} from '@/lib/businessSpecialties';
import {directoryMetadata} from '@/lib/seo';
import {getPageConfig} from '@/lib/sitePages';
import Link from 'next/link';
import {EditorialHeader,StoryTile,SectionHeading} from '@/components/discovery/Editorial';
import {fieldNotes} from '@/lib/fieldNotes';
import prisma from '@/lib/prisma';
import {publicMakerWhere} from '@/lib/makers';
export const dynamic='force-dynamic';
export async function generateMetadata({searchParams}:{searchParams:Promise<{page?:string;topic?:string}>}){const [c,p]=await Promise.all([getPageConfig('journal'),searchParams]);return directoryMetadata('/stories',c.seoTitle,c.seoDescription,{page:p.page,scope:p.topic});}
const topics=[{label:'All stories',value:''},{label:'From businesses',value:'businesses'},{label:'Dining',value:'Dining guide'},{label:'Buying guides',value:'Buying guide'},{label:'Gifting',value:'Gifting guide'},{label:'Kitchen & pantry',value:'kitchen'},...businessArticleTopics.map(t=>({label:t,value:'business:'+t}))];
export default async function Stories({searchParams}:{searchParams:Promise<{page?:string;topic?:string}>}){
 const params=await searchParams;const topic=topics.find(t=>t.value===params.topic)?.value||'';const businessTopic=businessArticleTopics.find(t=>'business:'+t===topic);const businessOnly=topic==='businesses'||!!businessTopic;const page=topic&&!businessOnly?1:Math.max(1,Math.min(10000,Number.parseInt(params.page||'1')||1));
 const notes=fieldNotes.filter(n=>!businessOnly&&(!topic||n.category===topic||topic==='kitchen'&&['Baking','Pantry notes','Growers’ notebook'].includes(n.category)));
 const rows=(!topic||businessOnly)?await prisma.blog.findMany({where:{published:true,isDeleted:false,supplier:publicMakerWhere,...(businessTopic?{category:businessTopic}:{})},skip:(page-1)*20,take:21,orderBy:[{publishedAt:'desc'},{id:'asc'}],select:{id:true,title:true,excerpt:true,slug:true,category:true,featuredImage:true,supplier:{select:{name:true,makerHandle:true}}}}).catch(error=>{console.error('Maker journal unavailable',error);return []}):[];
 const c=await getPageConfig('journal');return <div className="fp26-shell pb-12 fp-charcoal-discovery"><EditorialHeader eyebrow={c.eyebrow} title={c.title} description={c.description}/>
 <nav className="fp26-topicnav" aria-label="Journal topics">{topics.map(t=><Link key={t.label} aria-current={topic===t.value?'page':undefined} href={t.value?'/stories?topic='+encodeURIComponent(t.value):'/stories'}>{t.label}</Link>)}</nav>
 {page===1&&notes.length>0&&<section className="fp26-guide-section" aria-label="Editorial stories"><div className={notes.length===1?'fp26-guide-single':'fp26-guidegrid'}>{notes.map(note=><StoryTile key={note.slug} note={note}/>)}</div></section>}
 {rows.length>0&&<section className="fp26-guide-section"><SectionHeading title="From restaurants & food businesses"/><div className="fp26-resultgrid">{rows.slice(0,20).map(row=><article className="fp26-index" key={row.id}>{readArticleCover(row.featuredImage)&&<BusinessMedia src={readArticleCover(row.featuredImage)?.url} alt={readArticleCover(row.featuredImage)?.alt||""} className="fp-story-thumbnail"/>}<p className="fp26-label">{row.supplier?.name}{row.category?' · '+row.category:''}</p><h3><Link href={`/makers/${row.supplier?.makerHandle}/stories/${row.slug}`}>{row.title}</Link></h3><p>{row.excerpt}</p></article>)}</div></section>}
 {(!topic||businessOnly)&&(page>1||rows.length>20)&&<nav aria-label="Story pages" className="fp26-pagination">{page>1&&<Link href={'/stories?'+(businessOnly?'topic='+encodeURIComponent(topic)+'&':'')+'page='+(page-1)}>Previous</Link>}{rows.length>20&&<Link href={'/stories?'+(businessOnly?'topic='+encodeURIComponent(topic)+'&':'')+'page='+(page+1)}>Next</Link>}</nav>}
 {businessOnly&&rows.length===0&&<section className="fp26-empty"><div><h2>More business stories are on the way.</h2><p>Explore FreshPick’s editorial guides in the meantime.</p></div><Link href="/stories" className="fp26-textlink">Read all stories</Link></section>}
 <section className="fp26-guide-section fp-green-highlight"><div><p className="fp26-label">FreshPick for Business</p><h2>Good food has a story.</h2><p>Introduce your business, share your craft and publish articles through Business Studio after approval.</p></div><Link className="fp26-action" href="/for-businesses">Explore business features</Link></section><Link className="fp26-textlink" href="/blog">Browse the editorial archive</Link></div>
}