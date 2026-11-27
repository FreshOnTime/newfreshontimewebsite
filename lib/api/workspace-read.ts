import {authenticatedApiFetch} from './authenticated-fetch';

/** Bound the entire read, including session refresh and JSON parsing. Never retry writes here. */
export async function readWorkspace<T>(path:string,signal?:AbortSignal,timeoutMs=15000):Promise<T>{
 const controller=new AbortController();
 let timer:ReturnType<typeof setTimeout>|undefined;
 let removeAbort=()=>{};
 const guard=new Promise<never>((_,reject)=>{
  const cancel=()=>{controller.abort();reject(new DOMException('Request cancelled','AbortError'));};
  if(signal?.aborted){cancel();return;}
  signal?.addEventListener('abort',cancel,{once:true});
  removeAbort=()=>signal?.removeEventListener('abort',cancel);
  timer=setTimeout(()=>{controller.abort();reject(new Error('This is taking longer than expected. Please try again.'));},timeoutMs);
 });
 try{
  return await Promise.race([guard,(async()=>{
   if(controller.signal.aborted)throw new DOMException('Request cancelled','AbortError');
   const response=await authenticatedApiFetch(path,{cache:'no-store',signal:controller.signal});
   if(!response.ok)throw new Error(response.status===401?'Your session expired. Sign in again.':response.status===403?'You do not have access to this section.':'Unable to load this section. Please try again.');
   return await response.json() as T;
  })()]);
 }finally{if(timer!==undefined)clearTimeout(timer);removeAbort();}
}
