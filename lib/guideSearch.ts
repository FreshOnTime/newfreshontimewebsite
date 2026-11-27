type GuideSearchEntry={title:string;summary:string;category:string;aliases:readonly string[];location:string};
const normalize=(s:string)=>s.normalize('NFKD').replace(/\p{M}/gu,'').toLowerCase().trim();
const stop=new Set(['a','an','the','what','which','where','are','is','can','i','to','for','in','of','some','me','find','please','new','near','best','how','do','does','should','and','or']);
export function matchGuides<T extends GuideSearchEntry>(entries:readonly T[],q='',area='',kind=''):T[]{
 const query=normalize(q),location=normalize(area),tokens=query.split(/[^\p{L}\p{N}]+/u).filter(t=>t.length>1&&!stop.has(t));
 return entries.map((entry,index)=>{const hay=normalize([entry.title,entry.summary,entry.category,entry.location,...entry.aliases].join(' '));const score=query?(hay.includes(query)?100:tokens.reduce((n,t)=>n+(hay.includes(t)?1:0),0)):1;return {entry,index,score};}).filter(({entry,score})=>(!kind||entry.category===kind)&&(!location||normalize(entry.location).includes(location))&&score>0).sort((a,b)=>b.score-a.score||a.index-b.index).map(x=>x.entry);
}