type GuideSearchEntry={title:string;summary:string;category:string;aliases:readonly string[];location:string};
const normalize=(s:string)=>s.normalize('NFC').toLowerCase().trim();
const stop=new Set(['a','an','the','what','which','where','are','is','can','i','to','for','in','of','some','me','find','please','new','near','best','how','do','does','should','and','or']);
const tokenize=(s:string)=>s.split(/[^\p{L}\p{M}\p{N}]+/u).filter(Boolean);
export function matchGuides<T extends GuideSearchEntry>(entries:readonly T[],q='',area='',kind=''):T[]{
 const query=normalize(q),location=normalize(area),tokens=tokenize(query).filter(t=>!stop.has(t));
 return entries.map((entry,index)=>{
  const hay=normalize([entry.title,entry.summary,entry.category,entry.location,...entry.aliases].join(' '));
  const words=new Set(tokenize(hay));
  // All meaningful query terms must match; incidental fragments (e.g. "no" in "noodles") are not results.
  const score=!query?1:hay.includes(query)?100:tokens.length&&tokens.every(t=>words.has(t)||words.has(t+'s')||(t.endsWith('s')&&words.has(t.slice(0,-1))))?tokens.length:0;
  return {entry,index,score};
 }).filter(({entry,score})=>(!kind||entry.category===kind)&&(!location||normalize(entry.location).includes(location))&&score>0).sort((a,b)=>b.score-a.score||a.index-b.index).map(x=>x.entry);
}
