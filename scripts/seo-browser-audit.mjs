/* Run against the built app and isolated editorial fixtures, or a deployed site. */
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {chromium} from 'playwright';
const base=process.env.VISUAL_BASE_URL||process.env.BASE_URL||'http://localhost:3000';
const canonicalBase=(process.env.NEXT_PUBLIC_SITE_URL||'https://freshpick.lk').replace(/\/+$/,'');
const routes=['/','/explore','/explore/coffee-cafes','/explore/bakeries','/explore/groceries','/explore/farms','/explore/mobile-food','/experiences','/countries','/about','/locations/colombo','/food-atlas','/food-atlas/kottu','/guides/hoppers-vs-string-hoppers','/traditions/avurudu-food-traditions','/stories/the-bread-window','/editorial-policy'];
const browser=await chromium.launch({headless:true});
const report=[];
try{
 const page=await browser.newPage({viewport:{width:390,height:844}});
 const sitemap=await page.request.get(new URL('/sitemap.xml',base).href);assert.equal(sitemap.status(),200);
 const xml=await sitemap.text();
 const urls=await page.evaluate(text=>[...new DOMParser().parseFromString(text,'application/xml').getElementsByTagName('loc')].map(n=>n.textContent),xml);
 assert(urls.length>0,'Empty sitemap');assert.equal(new Set(urls).size,urls.length,'Duplicate sitemap URLs');
 assert(!urls.some(u=>/\/(admin|dashboard|api|auth|profile|refund)(\/|$)/.test(new URL(u).pathname)),'Private or legacy URLs in sitemap');
 const titles=new Set();
 for(const path of routes){
  const row={path,checks:{},errors:[]};report.push(row);
  try{
   const response=await page.goto(new URL(path,base).href,{waitUntil:'domcontentloaded',timeout:30000});
   assert.equal(response?.status(),200);const html=await response.text();assert(html.includes('<h1'),'Missing server-rendered headline');await page.locator('main h1').first().waitFor();
   await page.locator('link[rel=canonical]').first().waitFor({state:'attached'});
   const data=await page.evaluate(()=>({title:document.title,description:document.querySelector('meta[name=description]')?.getAttribute('content'),canonical:[...document.querySelectorAll('link[rel=canonical]')].map(x=>x.getAttribute('href')),robots:document.querySelector('meta[name=robots]')?.getAttribute('content')||'',h1:document.querySelectorAll('main h1').length,schemas:[...document.querySelectorAll('script[type="application/ld+json"]')].map(x=>JSON.parse(x.textContent||''))}));
   const check=(key,value)=>{row.checks[key]=Boolean(value);if(!value)row.errors.push(key);};
   check('title',data.title.trim()&&!titles.has(data.title));titles.add(data.title);
   if(path==='/countries'){check('coverage transparency',await page.getByText('Available now',{exact:true}).count()===1);}
   if(path==='/'){check('discovery identity',/food discovery/i.test(data.title)&&/food events/i.test(data.description||''));check('homepage identity section',await page.locator('#freshpick-discovery-title').count()===1);}
   check('description',data.description?.trim());
   // The origin with or without a final slash denotes the same homepage URL.
   const expectedCanonical=canonicalBase+path;
   const canonicalMatches=path==='/' ? [canonicalBase,expectedCanonical].includes(data.canonical[0]) : data.canonical[0]===expectedCanonical;
   check('canonical',data.canonical.length===1&&canonicalMatches);
   if(!row.checks.canonical)row.errors.push(`Expected ${expectedCanonical}; received ${JSON.stringify(data.canonical)}`);
   check('indexable',!data.robots.includes('noindex'));
   check('sitemap',urls.includes(canonicalBase+path));
   check('single H1',data.h1===1);check('RSS discovery',await page.locator('link[rel=alternate][type="application/rss+xml"]').count()>0);check('JSON-LD',data.schemas.length>0&&data.schemas.every(s=>s['@context']==='https://schema.org'));
   if(['/food-atlas/kottu','/guides/hoppers-vs-string-hoppers','/traditions/avurudu-food-traditions'].includes(path)){const article=data.schemas.find(s=>s['@type']==='Article');check('article dates and source',article?.datePublished&&article?.dateModified&&article?.citation&&article?.author?.url);check('visible modification date',await page.locator('main time[datetime]').count()>0);}
  }catch(e){row.errors.push(String(e.message));}
 }
 for(const path of ['/food-atlas?q=kottu','/explore/bakeries?area=Colombo','/refund']){
  const row={path,checks:{},errors:[]};report.push(row);
  try{await page.goto(new URL(path,base).href,{waitUntil:'domcontentloaded'});await page.locator('meta[name=robots]').first().waitFor({state:'attached'});const robots=await page.locator('meta[name=robots]').first().getAttribute('content');if(!robots?.includes('noindex'))row.errors.push('Expected noindex');}catch(e){row.errors.push(String(e.message));}
 }
 const feed=await page.request.get(new URL('/feed.xml',base).href);assert.equal(feed.status(),200);
 const feedXml=await feed.text();assert(await page.evaluate(text=>!new DOMParser().parseFromString(text,'application/xml').querySelector('parsererror'),feedXml),'Invalid feed XML');
 const llms=await page.request.get(new URL('/llms.txt',base).href);assert.equal(llms.status(),200);assert((await llms.text()).includes(canonicalBase+'/editorial-policy'));
}finally{await browser.close();await fs.mkdir('visual-review',{recursive:true});await fs.writeFile('visual-review/seo-audit.json',JSON.stringify(report,null,2));}
for(const row of report)console.log(row.errors.length?'FAIL':'PASS',row.path,row.errors.join('; '));
assert(report.every(r=>!r.errors.length),'SEO browser checks failed; see visual-review/seo-audit.json');
