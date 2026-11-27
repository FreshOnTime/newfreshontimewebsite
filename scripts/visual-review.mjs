/* Screenshots from an actual running site, never generated mockups. */
import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const base = process.env.VISUAL_BASE_URL || 'http://localhost:3000';
const historical = process.env.HISTORICAL_BASE_URL;
const maker = process.env.VISUAL_MAKER_PATH || '/makers/visual-review-bakery';
const routes = [
  ['homepage','/'],['discovery','/discover'],['dining','/eat-drink'],['food-products','/food-products'],['gifting','/gifting'],['food-tools','/food-tools'],['businesses','/for-businesses'],['directory','/makers'],['maker-profile',maker],
  ['item',process.env.VISUAL_ITEM_PATH || maker+'/items/visual-review-loaf'],
  ['story',process.env.VISUAL_STORY_PATH || maker+'/stories/visual-review-story'],
  ['field-note','/stories/the-bread-window'],['empty-directory','/makers?q=visual-no-match-000'],
  ['journal','/stories'],['journal-dining','/stories?topic=Dining%20guide'],['dining-guide','/stories/a-table-for-two'],['buying-guide','/stories/the-price-on-the-jar'],['gifting-guide','/stories/a-gift-worth-opening'],['about','/about'],['how-it-works','/how-it-works'],['join','/join'],['saved','/saved'],['help','/help'],['contact','/contact'],['login','/auth/login'],['signup','/auth/signup/customer'],['forgot','/auth/forgot'],
];
const out = process.env.VISUAL_OUTPUT_DIR || 'visual-review';
async function ready(page,path) {
  const response = await page.goto(path,{waitUntil:'networkidle',timeout:60000});
  assert(response && response.ok(), 'Failed to load '+path);
  await page.evaluate(async()=>{await document.fonts.ready; await Promise.all(Array.from(document.images).map(async i=>{i.loading='eager';try{await i.decode()}catch{}}));});
}
async function capture(page,name) {
  await page.screenshot({path:out+'/'+name+'.png',fullPage:true,animations:'disabled'});
  const overflow=await page.evaluate(()=>{const root=document.documentElement;return root.scrollWidth>root.clientWidth+1?{width:root.clientWidth,scrollWidth:root.scrollWidth,offenders:[...document.querySelectorAll('main *,header *,footer *')].filter(el=>{const r=el.getBoundingClientRect();return r.width>0&&r.right>root.clientWidth+2&&!el.closest('.lux-rail-track,.lux-result-jump,.lux-account-nav,.lux-craft-tabs')}).slice(0,8).map(el=>({tag:el.tagName,classes:el.getAttribute('class'),right:Math.round(el.getBoundingClientRect().right)}))}:null});
  assert(!overflow,'Horizontal overflow: '+name+' '+JSON.stringify(overflow));
  if (/^(homepage|discovery|dining|food-products|gifting|food-tools|businesses|journal)(-|$)/.test(name)) assert.equal(await page.locator('main h1').count(),1,'Expected a single main headline: '+name);
  const broken=await page.evaluate(()=>Array.from(document.querySelectorAll('main img')).filter(img=>img.complete&&img.naturalWidth===0).map(img=>img.currentSrc));
  assert.equal(broken.length,0,'Broken main images: '+name+' '+broken.join(','));
}
async function checkMobile(page,name){
 const measurements=await page.evaluate(()=>{
   const width=document.documentElement.clientWidth;
   const visible=el=>{const r=el.getBoundingClientRect(),style=getComputedStyle(el);return r.width>0&&r.height>0&&style.visibility!=='hidden'&&style.display!=='none'};
   const header=[...document.querySelectorAll('.fp-header-inner button[aria-label],.fp-header-inner a[aria-label]')].filter(visible).map(el=>({name:el.getAttribute('aria-label'),w:el.getBoundingClientRect().width,h:el.getBoundingClientRect().height,left:el.getBoundingClientRect().left,right:el.getBoundingClientRect().right}));
   const forms=[...document.querySelectorAll('.fp26-search input,.fp26-search button,.fp26-filters input:not([type=hidden]),.fp26-filters select,.fp26-filters button')].filter(visible).map(el=>({name:el.getAttribute('name')||el.getAttribute('aria-label')||el.tagName,left:el.getBoundingClientRect().left,right:el.getBoundingClientRect().right,height:el.getBoundingClientRect().height,font:parseFloat(getComputedStyle(el).fontSize),button:el.tagName==='BUTTON'}));
   const home=document.querySelector('.fp26-search'),action=home?.querySelector('button');
   const auth=document.querySelector('.fp-auth-fields'),aside=document.querySelector('.fp-auth-editorial');
   return {width,header,forms,homeAction:home&&action?{form:home.clientWidth,button:action.getBoundingClientRect().width}:null,authFirst:auth&&aside?auth.getBoundingClientRect().top<aside.getBoundingClientRect().top:true};
 });
 assert(measurements.width<=430,'Mobile viewport unexpectedly widened: '+name+' '+measurements.width);
 for(const item of measurements.header)assert(item.w>=43&&item.h>=43&&item.left>=-1&&item.right<=measurements.width+1,'Header control too small or clipped: '+name+' '+JSON.stringify(item));
 for(const item of measurements.forms)assert(item.left>=-1&&item.right<=measurements.width+1&&item.height>=43&&(item.button||item.font>=16),'Form control clipped, undersized or prone to iOS zoom: '+name+' '+JSON.stringify(item));
 if(measurements.homeAction)assert(measurements.homeAction.button>=measurements.homeAction.form-32,'Homepage search action should fill its row: '+name);
 assert(measurements.authFirst,'Mobile auth form must precede promotional imagery: '+name);
}
async function main(){
  await fs.mkdir(out,{recursive:true});
  const browser=await chromium.launch({headless:true});
  const errors=[];
  try{
    for(const width of [320,390,430,768,1440]){
      const phone=width<768;
      const context=await browser.newContext({viewport:{width,height:phone?844:900},deviceScaleFactor:1,...(phone?{isMobile:true,hasTouch:true}:{})});
      const page=await context.newPage();
      try{
        for(const [name,path] of routes){
          if((width===320||width===430)&&!['homepage','discovery','dining','food-products','directory','businesses','maker-profile','item','journal','field-note','join','login','signup','contact'].includes(name))continue;
          try{await ready(page,new URL(path,base).href);await capture(page,name+'-'+width);
            if(phone)await checkMobile(page,name+'-'+width);
            if(name==='homepage'){
              await page.locator('main[data-studio-motion="active"]').waitFor({timeout:15000});
              await page.locator('.fp26-storytile').first().scrollIntoViewIfNeeded();
              const family=await page.locator('main h1').evaluate(node=>getComputedStyle(node).fontFamily);
              assert(family.includes('Instrument Serif'),'Unexpected homepage font: '+family);
              const finish=await page.evaluate(()=>({paper:getComputedStyle(document.querySelector('main')).backgroundColor,search:parseFloat(getComputedStyle(document.querySelector('.fp26-search')).borderTopLeftRadius),image:parseFloat(getComputedStyle(document.querySelector('.fp-curated-lead-photo')).borderTopLeftRadius),button:parseFloat(getComputedStyle(document.querySelector('.fp-gift-collection .fp26-action')).borderTopLeftRadius)}));
              assert.equal(finish.paper,'rgb(248, 245, 238)');
              assert.equal(await page.locator('.heritage-footer').evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(23, 62, 43)');
              assert.equal(await page.locator('.fp-gift-collection .fp26-action').evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(36, 69, 57)');
              assert(finish.search>=(phone?12:16)&&finish.image>=12&&finish.button>=6&&finish.button<=12,'Premium radius tokens not applied: '+JSON.stringify(finish));
              await page.evaluate(()=>window.scrollTo(0,0));
              await page.waitForTimeout(1400);
              await capture(page,'motion-homepage-'+width);
              await page.locator('.heritage-header').screenshot({path:out+'/current-header-'+width+'.png'});
              await page.locator('.heritage-footer').screenshot({path:out+'/current-footer-'+width+'.png'});
              if(width>=1280){const contact=page.getByRole('navigation',{name:'Discover FreshPick',exact:true}).getByRole('link',{name:'Contact',exact:true});assert(await contact.isVisible());assert.equal(await contact.getAttribute('href'),'/contact');}
              if(phone){await page.getByRole('button',{name:'Open menu'}).click();await page.locator('#heritage-mobile-menu').waitFor();const contact=page.getByRole('navigation',{name:'Mobile discovery navigation'}).getByRole('link',{name:'Contact',exact:true});assert(await contact.isVisible());assert.equal(await contact.getAttribute('href'),'/contact');assert(await page.getByRole('navigation',{name:'Mobile discovery navigation'}).getByRole('link',{name:'Saved picks'}).isVisible());await page.screenshot({path:out+'/current-mobile-menu-'+width+'.png',animations:'disabled'});await page.keyboard.press('Escape');await page.getByRole('button',{name:'Open menu'}).waitFor();await page.getByRole('button',{name:'Open search'}).click();await page.locator('#nav-search').waitFor();assert(await page.locator('#nav-search').isEditable());await page.getByRole('button',{name:'Close search'}).click();}
              assert.equal(await page.locator('.fp26-search').getAttribute('action'),'/discover');
              assert.equal(await page.getByRole('link',{name:'Browse gift suppliers',exact:true}).getAttribute('href'),'/gifting');
              assert.equal(await page.locator('.fp-connect-card').first().getAttribute('href'),'/eat-drink');
              await page.locator('.fp-explore-intro').screenshot({path:out+'/explore-intro-'+width+'.png'});
              await page.locator('#home-discover').fill('visual-no-match-000');
              await page.locator('.fp26-search button').click();
              await page.waitForURL(url=>url.pathname==='/discover'&&url.searchParams.get('q')==='visual-no-match-000');
              await page.getByRole('heading',{name:'No matching FreshPick profiles yet.'}).waitFor();
            }
            if(name==='item'){
              const details = page.locator('.lux-detail').first();
              await details.locator('summary').click();
              assert(!(await details.getAttribute('open')) && !(await details.evaluate(node=>node.open)),'Item accordion did not close');
              await details.locator('summary').click();
              assert(await details.evaluate(node=>node.open),'Item accordion did not open');
            }
            if(name==='businesses'){
              await page.getByRole('button',{name:'Café',exact:true}).click();
              assert.equal(await page.getByRole('link',{name:'Create your business profile'}).getAttribute('href'),'/join?type=cafe');
            }
            if(name==='dining'){
              await page.getByRole('navigation',{name:'Business type'}).getByRole('link',{name:'Café',exact:true}).click();
              await page.waitForURL(url=>url.pathname==='/eat-drink'&&url.searchParams.get('type')==='cafe');
              assert(await page.getByRole('heading',{name:'Café Kumbuk',exact:true}).isVisible());
              assert.equal(await page.getByRole('heading',{name:'Ministry of Crab',exact:true}).count(),0);
            }
            if(name==='food-products'){
              await page.getByLabel('Food category',{exact:true}).selectOption('Drinks');
              await page.locator('.fp-brand-filters').getByRole('button',{name:'Search'}).click();
              await page.waitForURL(url=>url.pathname==='/food-products'&&url.searchParams.get('kind')==='Drinks');
              assert.equal(await page.getByLabel('Food category',{exact:true}).inputValue(),'Drinks');
            }
            if(name==='gifting'){assert.equal(await page.getByText('Make the occasion special.',{exact:true}).count(),0);assert(await page.getByRole('heading',{name:'Gift ideas from local businesses'}).isVisible());}
            if(name==='discovery'){await page.getByLabel('What are you looking for?',{exact:true}).selectOption('dining');await page.locator('.fp26-filters').getByRole('button',{name:'Search'}).click();await page.waitForURL(url=>url.pathname==='/eat-drink');}
            if(name==='directory'){
              await page.getByLabel('Food category',{exact:true}).selectOption('Pantry');
              await page.getByLabel('Business type',{exact:true}).selectOption('food_brand');
              await page.locator('.fp-brand-filters').getByRole('button',{name:'Search'}).click();
              await page.waitForURL(url=>url.pathname==='/makers'&&url.searchParams.get('kind')==='Pantry'&&url.searchParams.get('type')==='food_brand');
              assert.equal(await page.getByLabel('Food category',{exact:true}).inputValue(),'Pantry');
              assert.equal(await page.getByLabel('Business type',{exact:true}).inputValue(),'food_brand');
              await page.getByRole('link',{name:'Clear filters',exact:true}).click();
              await page.waitForURL(url=>url.pathname==='/makers'&&!url.search);
              assert.equal(await page.getByLabel('Food category',{exact:true}).inputValue(),'');
            }
          }catch(error){errors.push(name+' '+width+': '+String(error));}
        }
        if(historical){
          try{await ready(page,new URL('/',historical).href);await page.locator('header').first().screenshot({path:out+'/historical-header-'+width+'.png'});await page.locator('footer').last().screenshot({path:out+'/historical-footer-'+width+'.png'});}catch(error){errors.push(String(error));}
        }
        if(process.env.VISUAL_LOGIN && process.env.VISUAL_PASSWORD){
          try{
            const login=await context.request.post(new URL('/api/auth/login',base).href,{data:{identifier:process.env.VISUAL_LOGIN,password:process.env.VISUAL_PASSWORD}});
            assert(login.ok(),'Test account login failed');
            await ready(page,new URL('/dashboard',base).href);
            await page.getByRole('heading',{name:'Business studio.'}).waitFor({timeout:20000});
            await page.getByRole('heading',{name:'Public profile'}).waitFor({timeout:20000});
            await capture(page,'maker-studio-'+width);
          }catch(error){errors.push(String(error));}
        }else errors.push('Maker Studio requires a non-sensitive test login.');
      }finally{await context.close();}
    }
    // Exercise the true pre-launch state in the explicitly isolated fixture database only.
    if (process.env.FRESHPICK_VISUAL_FIXTURES === '1') {
      const database = new URL(process.env.DATABASE_URL || 'postgresql://invalid');
      assert.equal(database.hostname, 'localhost');
      assert.equal(database.pathname, '/freshpick_visual');
      const { PrismaClient } = await import('@prisma/client');
      const db = new PrismaClient();
      try {
        const fixture = await db.supplier.findUnique({where:{makerHandle:'visual-review-bakery'},select:{id:true,makerPublished:true}});
        assert(fixture, 'Expected isolated fixture');
        await db.supplier.update({where:{id:fixture.id},data:{makerPublished:false}});
        try {
          for (const width of [390,1440]) {
            const context=await browser.newContext({viewport:{width,height:width===390?844:900},reducedMotion:'reduce'});
            try {
              const page=await context.newPage();
              await ready(page,new URL('/makers',base).href);
              await page.getByRole('heading',{name:'Independent food brands to explore'}).waitFor();
              await page.getByRole('heading',{name:'Meet the world of local food'}).waitFor();
              assert.equal(await page.locator('#makers-results').count(),0);
              await capture(page,'directory-launch-'+width);
            } finally { await context.close(); }
          }
        } finally {
          await db.supplier.update({where:{id:fixture.id},data:{makerPublished:fixture.makerPublished}});
        }
      } catch(error) { errors.push(String(error)); }
      finally { await db.$disconnect(); }
    }
    const reduced=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
    try{
      const page=await reduced.newPage();
      await ready(page,new URL('/',base).href);
      assert.equal(await page.locator('main').getAttribute('data-studio-motion'),null,'Reduced motion must not activate GSAP');
      assert(await page.getByRole('heading',{name:'Find your next favourite.'}).isVisible(),'Headline must remain visible');
      await capture(page,'reduced-motion-homepage-390');
    }catch(error){errors.push(String(error));}finally{await reduced.close();}
  }finally{await browser.close();}
  if(errors.length)throw new Error(errors.join('\n'));
}
main().catch(error=>{console.error(error);process.exitCode=1;});
