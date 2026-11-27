import prisma from '@/lib/prisma';
import {contentPath,publishedContentWhere} from '@/lib/discoveryContent';
import {editorialFeed} from '@/lib/editorialSearch';
export const dynamic='force-dynamic';
export async function GET(){
 try{
  const rows=await prisma.discoveryContent.findMany({where:{...publishedContentWhere,kind:{in:['dish','tradition','guide']}},select:{kind:true,slug:true,title:true,summary:true,category:true,publishedAt:true},orderBy:[{publishedAt:'desc'},{slug:'asc'}],take:50});
  return new Response(editorialFeed(rows.map(r=>({...r,path:contentPath(r.kind,r.slug)}))),{headers:{'Content-Type':'application/rss+xml; charset=utf-8','Cache-Control':'public, max-age=300, s-maxage=900'}});
 }catch{
  return new Response('Editorial feed temporarily unavailable',{status:503,headers:{'Cache-Control':'no-store','Retry-After':'300'}});
 }
}
