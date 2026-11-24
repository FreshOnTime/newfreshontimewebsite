/* Screenshots from an actual running site, never generated mockups. */
import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const base = process.env.VISUAL_BASE_URL || 'http://localhost:3000';
const historical = process.env.HISTORICAL_BASE_URL;
const maker = process.env.VISUAL_MAKER_PATH || '/makers/visual-review-bakery';
const routes = [
  ['homepage','/'],['directory','/makers'],['maker-profile',maker],
  ['item',process.env.VISUAL_ITEM_PATH || maker+'/items/visual-review-loaf'],
  ['story',process.env.VISUAL_STORY_PATH || maker+'/stories/visual-review-story'],
  ['field-note','/stories/the-bread-window'],['empty-directory','/makers?q=visual-no-match-000'],
  ['journal','/stories'],['about','/about'],['how-it-works','/how-it-works'],['join','/join'],['saved','/saved'],['help','/help'],['contact','/contact'],['login','/auth/login'],['signup','/auth/signup/customer'],['forgot','/auth/forgot'],
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
}
async function main(){
  await fs.mkdir(out,{recursive:true});
  const browser=await chromium.launch({headless:true});
  const errors=[];
  try{
    for(const width of [390,1440]){
      const context=await browser.newContext({viewport:{width,height:width===390?844:900},deviceScaleFactor:1});
      const page=await context.newPage();
      try{
        for(const [name,path] of routes){
          try{await ready(page,new URL(path,base).href);await capture(page,name+'-'+width);
            if(name==='homepage'){
              await page.locator('main[data-studio-motion="active"]').waitFor({timeout:15000});
              await page.locator('[data-studio-feature]').first().scrollIntoViewIfNeeded();
              await page.evaluate(()=>window.scrollTo(0,0));
              await page.waitForTimeout(1400);
              await capture(page,'motion-homepage-'+width);
              await page.locator('.heritage-header').screenshot({path:out+'/current-header-'+width+'.png'});
              await page.locator('.heritage-footer').screenshot({path:out+'/current-footer-'+width+'.png'});
              if(width===390){await page.getByRole('button',{name:'Open menu'}).click();await page.locator('#heritage-mobile-menu').waitFor();await page.screenshot({path:out+'/current-mobile-menu-390.png',animations:'disabled'});await page.getByRole('button',{name:'Close menu'}).click();}
              const rail = page.getByRole('region',{name:'food crafts'});
              const next = page.getByRole('button',{name:'Next food crafts'});
              await next.click();
              await page.waitForFunction(()=>document.querySelector('.lux-rail-track').scrollLeft>10);
              await rail.screenshot({path:out+'/craft-gallery-'+width+'.png'});
              await page.locator('#home-discover').fill('visual-no-match-000');
              await page.locator('.journal-discover button').click();
              await page.waitForURL('**/makers?q=visual-no-match-000');
              await page.getByRole('heading',{name:'No matches this time.'}).waitFor();
            }
            if(name==='item'){
              const details = page.locator('.lux-detail').first();
              await details.locator('summary').click();
              assert(!(await details.getAttribute('open')) && !(await details.evaluate(node=>node.open)),'Item accordion did not close');
              await details.locator('summary').click();
              assert(await details.evaluate(node=>node.open),'Item accordion did not open');
            }
            if(name==='directory'){
              await page.getByRole('navigation',{name:'Browse by craft'}).getByRole('link',{name:'Bakery',exact:true}).click();
              await page.waitForURL('**/makers?kind=Bakery');
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
            await page.getByRole('heading',{name:'Maker studio.'}).waitFor({timeout:20000});
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
              await page.getByRole('heading',{name:'The directory is opening.'}).waitFor();
              await page.getByRole('heading',{name:'Find your kind of food.'}).waitFor();
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
      assert(await page.getByRole('heading',{name:'Good food. Closer to home.'}).isVisible(),'Headline must remain visible');
      await capture(page,'reduced-motion-homepage-390');
    }catch(error){errors.push(String(error));}finally{await reduced.close();}
  }finally{await browser.close();}
  if(errors.length)throw new Error(errors.join('\n'));
}
main().catch(error=>{console.error(error);process.exitCode=1;});
