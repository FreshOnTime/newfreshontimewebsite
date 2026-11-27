import {absoluteUrl,SITE_NAME_LONG} from './config/site';
export type EditorialFacts={path:string;title:string;summary:string;publishedAt?:Date|null;updatedAt?:Date|null;sourceUrl?:string|null;aliases?:readonly string[];category?:string;image?:string};
const validDate=(value?:Date|null)=>value instanceof Date&&!Number.isNaN(value.getTime())?value.toISOString():undefined;
export function editorialArticle(f:EditorialFacts){
 const published=validDate(f.publishedAt),updated=validDate(f.updatedAt);
 return {'@context':'https://schema.org','@type':'Article','@id':absoluteUrl(f.path)+'#article',url:absoluteUrl(f.path),headline:f.title,description:f.summary,mainEntityOfPage:{'@id':absoluteUrl(f.path)},author:{'@type':'Organization',name:'FreshPick editorial',url:absoluteUrl('/editorial-policy')},publisher:{'@id':absoluteUrl('/#organization')},inLanguage:'en-LK',...(published?{datePublished:published}:{}),...(updated?{dateModified:updated}:{}),...(f.sourceUrl?{citation:f.sourceUrl}:{}),...(f.category?{articleSection:f.category}:{}),...(f.aliases?.length?{about:{'@type':'Thing',name:f.title,alternateName:[...f.aliases]}}:{}),...(f.image?{image:absoluteUrl(f.image)}:{})};
}
export function xmlText(value:string){return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g,'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');}
export function editorialFeed(entries:readonly EditorialFacts[]){
 const text=xmlText;
 return '<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>'+text(SITE_NAME_LONG+' editorial')+'</title><link>'+text(absoluteUrl('/stories'))+'</link><description>Published Sri Lankan food, culture and comparison guides from FreshPick.</description><language>en-lk</language><atom:link href="'+text(absoluteUrl('/feed.xml'))+'" rel="self" type="application/rss+xml"/>'+entries.map(e=>{const url=text(absoluteUrl(e.path));return '<item><title>'+text(e.title)+'</title><link>'+url+'</link><guid isPermaLink="true">'+url+'</guid><description>'+text(e.summary)+'</description>'+(validDate(e.publishedAt)?'<pubDate>'+e.publishedAt!.toUTCString()+'</pubDate>':'')+(e.category?'<category>'+text(e.category)+'</category>':'')+'</item>';}).join('')+'</channel></rss>';
}
