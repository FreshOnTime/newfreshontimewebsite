'use client';
import {useRef,useState} from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function ArticleEditor({initial='',fieldClass}:{initial?:string;fieldClass:string}){
 const [body,setBody]=useState(initial);
 const [preview,setPreview]=useState(false);
 const input=useRef<HTMLTextAreaElement>(null);
 function format(before:string,after:string,placeholder:string){
  const el=input.current;if(!el)return;
  const start=el.selectionStart,end=el.selectionEnd;
  const chosen=body.slice(start,end)||placeholder;
  const next=body.slice(0,start)+before+chosen+after+body.slice(end);
  if(next.length>18000)return;
  setBody(next);
  requestAnimationFrame(()=>{el.focus();el.setSelectionRange(start+before.length,start+before.length+chosen.length)});
 }
 return <div className="grid gap-2 min-w-0">
  <label htmlFor="studio-article-body" className="text-sm font-semibold">Article body</label>
  <div className="flex flex-wrap gap-2" role="group" aria-label="Article formatting">
   {[['Heading','\n## ','\n','Section heading'],['Bold','**','**','important text'],['Italic','*','*','emphasis'],['Bullet list','\n- ','\n','List item'],['Quote','\n> ','\n','Quotation']].map(([label,before,after,placeholder])=><button key={label} type="button" disabled={preview} onClick={()=>format(before,after,placeholder)} className="min-h-11 rounded-md border border-border px-3 text-sm disabled:opacity-50">{label}</button>)}
   <button type="button" onClick={()=>setPreview(v=>!v)} aria-pressed={preview} className="min-h-11 rounded-md border border-border px-3 text-sm font-semibold">{preview?'Back to editing':'Preview article'}</button>
  </div>
  <textarea ref={input} id="studio-article-body" name="content" className={fieldClass} rows={10} value={body} onChange={e=>setBody(e.target.value)} onInvalid={()=>setPreview(false)} required minLength={3} maxLength={18000} hidden={preview} aria-describedby="article-editor-help"/>
  {preview&&<div className="rounded-lg border border-border p-4 min-h-40 prose max-w-none break-words" aria-label="Article preview">{body.trim()?<ReactMarkdown skipHtml disallowedElements={['img']} remarkPlugins={[remarkGfm]} components={{a:({children})=><span className="underline">{children}</span>}}>{body}</ReactMarkdown>:<p>Start writing to preview your article.</p>}</div>}
  <p id="article-editor-help" className="text-xs text-muted-foreground">Use headings and formatting to organise your story. {body.length.toLocaleString('en-LK')} / 18,000 characters.</p>
 </div>;
}
