// Read-only release smoke test. Never sends credentials or mutates accounts.
import assert from 'node:assert/strict';
const base=new URL(process.env.BASE_URL||'https://www.freshpick.lk');
if(!['https:','http:'].includes(base.protocol))throw Error('Invalid base URL');
const routes=[['/','Find your next'],['/discover',''],['/explore',''],['/explore/bakeries',''],['/explore/coffee-cafes',''],['/explore/produce',''],['/food-atlas',''],['/food-atlas/hoppers','Hoppers'],['/guides/hoppers-vs-string-hoppers',''],['/traditions',''],['/stories',''],['/for-businesses',''],['/contact',''],['/auth/forgot','Reset your password'],['/sitemap.xml','/explore/bakeries']];
let errors=0;
for(const [path,marker] of routes){try{const res=await fetch(new URL(path,base),{signal:AbortSignal.timeout(20000)});const body=await res.text();assert.equal(res.status,200);assert(!/Application error: a server-side exception|Internal Server Error|Some listings are temporarily unavailable/i.test(body),'Application error content');if(marker)assert(body.toLowerCase().includes(marker.toLowerCase()),'Expected release content missing');console.log('PASS',path);}catch(e){errors++;console.error('FAIL',path,e.message);}}
console.log(routes.length-errors+'/'+routes.length+' checks passed');
if(errors)process.exitCode=1;
