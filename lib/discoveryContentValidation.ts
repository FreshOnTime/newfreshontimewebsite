import {z} from 'zod';
const slug=z.string().trim().min(1).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const text=(max:number)=>z.string().trim().max(max);
const source=text(1000).refine(v=>{if(!v)return true;try{const u=new URL(v);return u.protocol==='https:'&&!u.username&&!u.password&&!u.port}catch{return false}},'Use an HTTPS source URL');
const date=z.string().datetime({offset:true}).nullable();
export const contentInput=z.object({
 kind:z.enum(['dish','tradition','event','guide']),slug,title:text(160).min(1),category:text(80).min(1),summary:text(500).min(1),body:text(20000).min(1),
 aliases:z.array(text(100).min(1)).max(30),variations:z.array(text(160).min(1)).max(30),relatedDishes:z.array(slug).max(30),searchTerm:text(100),sourceUrl:source,sourceName:text(160),location:text(200),startsAt:date,endsAt:date,published:z.boolean(),confirmed:z.boolean()
}).strict().superRefine((v,ctx)=>{
 const issue=(path:string,message:string)=>ctx.addIssue({code:'custom',path:[path],message});
 if(v.kind==='guide'&&!['Comparison','Meal ideas','Place guide','Food guide'].includes(v.category))issue('category','Choose Comparison, Meal ideas, Place guide or Food guide');
 if(v.kind!=='event'&&(v.startsAt||v.endsAt))issue('startsAt','Only events have dates');
 if(v.startsAt&&v.endsAt&&Date.parse(v.endsAt)<=Date.parse(v.startsAt))issue('endsAt','End must be after start');
 if(v.published){if(!v.confirmed)issue('confirmed','Confirm source accuracy and publication rights');if(!v.sourceUrl||!v.sourceName)issue('sourceUrl','Published content requires a source and source name');if(v.kind==='event'&&(!v.startsAt||!v.endsAt||!v.location))issue('startsAt','Published events need start, end and location');}
});
export type ContentInput=z.infer<typeof contentInput>;
