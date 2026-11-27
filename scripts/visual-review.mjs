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
  const overflow = await page.evaluate(()=>document.documentElement.scrollWidth > innerWidth+1);
  assert(!overflow,'Horizontal overflow: '+name);
  if (/^(homepage|discovery|dining|food-products|gifting|food-tools|businesses|journal)(-|$)/.test(name)) assert.equal(await page.locator('main h1').count(),1,'Expected a single main headline: '+name);
  const broken=await page.evaluate(()=>Array.from(document.querySelectorAll('main img')).filter(img=>img.complete&&img.naturalWidth===0).map(img=>img.currentSrc));
  assert.equal(broken.length,0,'Broken main images: '+name+' '+broken.join(','));
}
async function main(){
  await fs.mkdir(out,{recursive:true});
  const browser=await chromium.launch({headless:true});
  const errors=[];
  try{
    for(const width of [390,768,1440]){
      const context=await browser.newContext({viewport:{width,height:width===390?844:900},deviceScaleFactor:1});
      const page=await context.newPage();
      try{
        for(const [name,path] of routes){
          try{await ready(page,new URL(path,base).href);await capture(page,name+'-'+width);
            if(name==='homepage'){
              await page.locator('main[data-studio-motion="active"]').waitFor({timeout:15000});
              await page.locator('.fp26-storytile').first().scrollIntoViewIfNeeded();
              const family=await page.locator('main h1').evaluate(node=>getComputedStyle(node).fontFamily);
              assert(family.includes('Instrument Serif'),'Unexpected homepage font: '+family);
              const finish=await page.evaluate(()=>({paper:getComputedStyle(document.querySelector('main')).backgroundColor,search:parseFloat(getComputedStyle(document.querySelector('.fp26-search')).borderTopLeftRadius),gift:parseFloat(getComputedStyle(document.querySelector('.fp-gift-feature')).borderTopLeftRadius),image:parseFloat(getComputedStyle(document.querySelector('.fp-curated-lead-photo')).borderTopLeftRadius),button:parseFloat(getComputedStyle(document.querySelector('.fp-gift-copy .fp26-action')).borderTopLeftRadius)}));
              assert.equal(finish.paper,'rgb(248, 245, 238)');
              assert(finish.search>=16&&finish.gift>=20&&finish.image>=12&&finish.button>=24,'Premium radius tokens not applied: '+JSON.stringify(finish));
              await page.evaluate(()=>window.scrollTo(0,0));
              await page.waitForTimeout(1400);
              await capture(page,'motion-homepage-'+width);
              await page.locator('.heritage-header').screenshot({path:out+'/current-header-'+width+'.png'});
              await page.locator('.heritage-footer').screenshot({path:out+'/current-footer-'+width+'.png'});
              if(width===390){await page.getByRole('button',{name:'Open menu'}).click();await page.locator('#heritage-mobile-menu').waitFor();await page.screenshot({path:out+'/current-mobile-menu-390.png',animations:'disabled'});await page.getByRole('button',{name:'Close menu'}).click();}
              assert.equal(await page.locator('.fp26-search').getAttribute('action'),'/discover');
              assert.equal(await page.getByRole('link',{name:'Plan your gift',exact:true}).getAttribute('href'),'/gifting#gift-planner');
              assert.equal(await page.getByRole('link',{name:'Find a restaurant',exact:true}).getAttribute('href'),'/eat-drink');
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
            if(name==='gifting'){
              await page.getByLabel('Total budget (LKR)').fill('10000');
              await page.getByLabel('Quantity').fill('5');
              await page.getByLabel('Gift enquiry brief').waitFor();
              assert((await page.getByLabel('Gift enquiry brief').inputValue()).includes('Quantity: 5'));
            }
            if(name==='directory'){
              await page.getByRole('navigation',{name:'Browse by craft'}).getByRole('link',{name:'Bakery',exact:true}).click();
              await page.waitForURL(url=>url.pathname==='/makers'&&url.searchParams.get('kind')==='Bakery');
              assert.equal(await page.getByRole('navigation',{name:'Browse by craft'}).getByRole('link',{name:'Bakery',exact:true}).getAttribute('aria-current'),'page');
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
