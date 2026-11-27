import Link from 'next/link';
import {EditorialHeader,StoryTile,SectionHeading} from '@/components/discovery/Editorial';
import {fieldNotes} from '@/lib/fieldNotes';
import prisma from '@/lib/prisma';
import {publicMakerWhere} from '@/lib/makers';
export const dynamic='force-dynamic';
export const metadata={title:'The food journal'};
const topics=[{label:'All stories',value:''},{label:'Dining',value:'Dining guide'},{label:'Buying guides',value:'Buying guide'},{label:'Gifting',value:'Gifting guide'},{label:'Kitchen & pantry',value:'kitchen'}];
export default async function Stories({searchParams}:{searchParams:Promise<{page?:string;topic?:string}>}){
 const params=await searchParams;const topic=topics.find(t=>t.value===params.topic)?.value||'';const page=topic?1:Math.max(1,Math.min(10000,Number.parseInt(params.page||'1')||1));
 const notes=fieldNotes.filter(n=>!topic||n.category===topic||topic==='kitchen'&&['Baking','Pantry notes','Growers’ notebook'].includes(n.category));
 const rows=!topic?await prisma.blog.findMany({where:{published:true,isDeleted:false,supplier:publicMakerWhere},skip:(page-1)*20,take:21,orderBy:[{publishedAt:'desc'},{id:'asc'}],select:{id:true,title:true,excerpt:true,slug:true,supplier:{select:{name:true,makerHandle:true}}}}).catch(error=>{console.error('Maker journal unavailable',error);return []}):[];
 return <div className="fp26-shell pb-12"><EditorialHeader eyebrow="FreshPick editorial" title="The food journal." description="Buying guides, kitchen notes and stories from independent food businesses."/>
 <nav className="fp26-topicnav" aria-label="Journal topics">{topics.map(t=><Link key={t.label} aria-current={topic===t.value?'page':undefined} href={t.value?'/stories?topic='+encodeURIComponent(t.value):'/stories'}>{t.label}</Link>)}</nav>
 {page===1&&notes.length>0&&<section className="fp26-guide-section" aria-label="Editorial stories"><div className={notes.length===1?'fp26-guide-single':'fp26-guidegrid'}>{notes.map(note=><StoryTile key={note.slug} note={note}/>)}</div></section>}
 {rows.length>0&&<section className="fp26-guide-section"><SectionHeading title="From restaurants & food businesses"/><div className="fp26-resultgrid">{rows.slice(0,20).map(row=><article className="fp26-index" key={row.id}><p className="fp26-label">{row.supplier?.name}</p><h3><Link href={`/makers/${row.supplier?.makerHandle}/stories/${row.slug}`}>{row.title}</Link></h3><p>{row.excerpt}</p></article>)}</div></section>}
 {!topic&&(page>1||rows.length>20)&&<nav aria-label="Story pages" className="fp26-pagination">{page>1&&<Link href={'/stories?page='+(page-1)}>Previous</Link>}{rows.length>20&&<Link href={'/stories?page='+(page+1)}>Next</Link>}</nav>}
 <Link className="fp26-textlink" href="/blog">Browse the editorial archive</Link></div>
}