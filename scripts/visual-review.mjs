/* Screenshots from an actual running site, never generated mockups. */
import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const base = process.env.VISUAL_BASE_URL || 'http://localhost:3000';
const historical = process.env.HISTORICAL_BASE_URL;
const maker = process.env.VISUAL_MAKER_PATH || '/makers/visual-review-bakery';
const routes = [
  ['homepage','/'],['departments','/explore'],['department-bakery','/explore/bakeries'],['department-coffee','/explore/coffee-cafes'],['department-produce','/explore/produce'],['live','/live'],['atlas','/food-atlas'],['atlas-dish','/food-atlas/kottu'],['experiences','/experiences'],['traditions','/traditions'],['guides','/guides'],['guide-detail','/guides/hoppers-vs-string-hoppers'],['tradition-detail','/traditions/avurudu-food-traditions'],['event-detail','/experiences/events/visual-review-event'],['discovery','/discover'],['dining','/eat-drink'],['food-products','/food-products'],['gifting','/gifting'],['food-tools','/food-tools'],['businesses','/for-businesses'],['directory','/makers'],['maker-profile',maker],
  ['item',process.env.VISUAL_ITEM_PATH || maker+'/items/visual-review-loaf'],
  ['story',process.env.VISUAL_STORY_PATH || maker+'/stories/visual-review-story'],
  ['field-note','/stories/the-bread-window'],['empty-directory','/makers?q=visual-no-match-000'],
  ['journal','/stories'],['journal-dining','/stories?topic=Dining%20guide'],['dining-guide','/stories/a-table-for-two'],['buying-guide','/stories/the-price-on-the-jar'],['gifting-guide','/stories/a-gift-worth-opening'],['about','/about'],['how-it-works','/how-it-works'],['join','/join'],['saved','/saved'],['help','/help'],['contact','/contact'],['login','/auth/login'],['account-choice','/auth/signup'],['not-found','/freshpick-visual-missing-page-404'],['signup','/auth/signup/customer'],['forgot','/auth/forgot'],
];
const out = process.env.VISUAL_OUTPUT_DIR || 'visual-review';
async function ready(page,path,expectedStatus=200) {
  const response = await page.goto(path,{waitUntil:'networkidle',timeout:60000});
  assert(response && response.status()===expectedStatus, 'Unexpected status for '+path+': '+response?.status());
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
          if((width===320||width===430)&&!['homepage','departments','department-bakery','department-coffee','department-produce','live','atlas','atlas-dish','experiences','traditions','guides','guide-detail','tradition-detail','event-detail','discovery','dining','food-products','directory','businesses','maker-profile','item','journal','field-note','join','login','signup','account-choice','not-found','contact'].includes(name))continue;
          try{await ready(page,new URL(path,base).href,name==='not-found'?404:200);await capture(page,name+'-'+width);
            if(phone)await checkMobile(page,name+'-'+width);
            if(name==='not-found'){assert.equal(await page.locator('main h1').count(),1);assert.equal(await page.getByRole('link',{name:'Discover food',exact:true}).getAttribute('href'),'/discover');}
            if(name==='account-choice'){assert(await page.getByRole('heading',{name:'Member account',exact:true}).isVisible());assert(await page.getByRole('heading',{name:'Business page',exact:true}).isVisible());}
            if(name==='homepage'){
              assert.equal(await page.locator('#home-headline').textContent(),'Discover the world of food.');
              assert(await page.getByRole('navigation',{name:'Explore food discovery'}).getByRole('link',{name:'Food events & experiences'}).isVisible());
              await page.locator('main[data-studio-motion="active"]').waitFor({timeout:15000});
              await page.locator('.fp26-storytile').first().scrollIntoViewIfNeeded();
              const family=await page.locator('main h1').evaluate(node=>getComputedStyle(node).fontFamily);
              assert(family.includes('Instrument Serif'),'Unexpected homepage font: '+family);
              const finish=await page.evaluate(()=>({paper:getComputedStyle(document.querySelector('main')).backgroundColor,search:parseFloat(getComputedStyle(document.querySelector('.fp26-search')).borderTopLeftRadius),image:parseFloat(getComputedStyle(document.querySelector('.fp-curated-lead-photo')).borderTopLeftRadius),button:parseFloat(getComputedStyle(document.querySelector('.fp-gift-collection .fp26-action')).borderTopLeftRadius)}));
              assert.equal(finish.paper,'rgb(248, 245, 238)');
              assert.equal(await page.locator('.heritage-footer').evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(23, 62, 43)');
              for(const selector of ['.fp-gift-collection','.fp-return-shelf']){const styles=await page.locator(selector).evaluate(el=>({background:getComputedStyle(el).backgroundColor,heading:getComputedStyle(el.querySelector('h2')).color,button:getComputedStyle(el.querySelector('.fp26-action')).borderTopColor}));assert.equal(styles.background,'rgb(25, 28, 25)');assert.equal(styles.heading,'rgb(255, 255, 255)');assert(['rgb(185, 233, 140)','rgba(0, 0, 0, 0)'].includes(styles.button),'Unexpected CTA border '+styles.button);assert(await page.locator(selector+' .fp26-action').isVisible());}
              assert.equal(await page.locator('.fp-footer-explore-list').evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').length),2);
              assert(finish.search>=(phone?12:16)&&finish.image>=12&&finish.button>=6&&finish.button<=12,'Premium radius tokens not applied: '+JSON.stringify(finish));
              await page.evaluate(()=>window.scrollTo(0,0));
              await page.waitForTimeout(1400);
              await capture(page,'motion-homepage-'+width);
              await page.locator('.heritage-header').screenshot({path:out+'/current-header-'+width+'.png'});
              await page.locator('.heritage-footer').screenshot({path:out+'/current-footer-'+width+'.png'});
              if(width>=1280){const contact=page.getByRole('navigation',{name:'Discover FreshPick',exact:true}).getByRole('link',{name:'Contact',exact:true});assert(await contact.isVisible());assert.equal(await contact.getAttribute('href'),'/contact');}
              if(phone){await page.getByRole('button',{name:'Open menu'}).click();await page.locator('#heritage-mobile-menu').waitFor();const mobileNav=page.getByRole('navigation',{name:'Mobile discovery navigation'});await mobileNav.locator('summary').filter({hasText:'Discover'}).click();assert(await mobileNav.getByRole('link',{name:'Food departments',exact:true}).isVisible());await mobileNav.locator('summary').filter({hasText:'Journal & food culture'}).click();assert(await mobileNav.getByRole('link',{name:'Food guides & comparisons',exact:true}).isVisible());await mobileNav.locator('summary').filter({hasText:'Business & support'}).click();const contact=mobileNav.getByRole('link',{name:'Contact',exact:true});assert(await contact.isVisible());assert.equal(await contact.getAttribute('href'),'/contact');await mobileNav.locator('summary').filter({hasText:'Your account'}).click();assert(await mobileNav.getByRole('link',{name:'Saved picks',exact:true}).isVisible());await page.screenshot({path:out+'/current-mobile-menu-'+width+'.png',animations:'disabled'});await page.keyboard.press('Escape');await page.getByRole('button',{name:'Open menu'}).waitFor();await page.getByRole('button',{name:'Open search'}).click();await page.locator('#nav-search').waitFor();assert(await page.locator('#nav-search').isEditable());await page.getByRole('button',{name:'Close search'}).click();}
              assert.equal(await page.locator('.fp26-search').getAttribute('action'),'/discover');
              assert.equal(await page.locator('.fp-hub-path').count(),6);
              assert.equal(await page.locator('.fp-occasion-photo img').count(),4);
              assert.equal(await page.locator('.fp-home-panel[data-home-section="guides"] .fp-guide-feature-photo img').count(),1);
              assert.equal(await page.locator('.fp-home-business .fp26-action').evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(169, 219, 118)');
              const carousel=page.locator('.fp-hero-carousel');
              await carousel.getByRole('button',{name:'Next discovery'}).click();
              await carousel.getByRole('heading',{name:'Discover the craft behind the food.',exact:true}).waitFor();
              assert.equal(await carousel.getByRole('link',{name:'Explore',exact:true}).getAttribute('href'),'/makers');
              await carousel.getByRole('button',{name:'Previous discovery'}).click();
              await carousel.getByRole('heading',{name:'Find something delicious.',exact:true}).waitFor();
              assert.equal(await page.locator('.fp-hub-path[href="/food-atlas"]').count(),1);
              assert.equal(await page.locator('.fp26-search button').evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(169, 219, 118)');
              assert.equal(await page.getByRole('link',{name:'Browse gift suppliers',exact:true}).getAttribute('href'),'/gifting');
              assert.equal(await page.locator('.fp-department-card').count(),12);
              assert.equal(await page.locator('.fp-department-card').first().getAttribute('href'),'/explore/places');
              assert.equal(await page.locator('#home-area').inputValue(),'Sri Lanka');
              assert.equal(await page.locator('[data-home-section="culture"]').count(),0);
              if(!phone&&width>=1440){const journal=page.getByRole('button',{name:'Journal and food culture'});await journal.click();await page.getByRole('menuitem',{name:'Food guides & comparisons'}).waitFor();await page.keyboard.press('Escape');}

              assert(await page.locator('.fp-dish-black-card').count()>0);assert.equal(await page.locator('.fp-dish-black-card img').count(),0);
              await page.locator('.fp-explore-intro').screenshot({path:out+'/explore-intro-'+width+'.png'});
              await page.locator('#home-discover').fill('visual-no-match-000');
              await page.locator('.fp26-search button').click();
              await page.waitForURL(url=>url.pathname==='/discover'&&url.searchParams.get('q')==='visual-no-match-000');
              await page.locator('#main-content .fp26-resultbar[data-query="visual-no-match-000"]').waitFor();
              await page.locator('#main-content').getByRole('heading',{name:'No matching FreshPick profiles yet.',exact:true}).waitFor();
            }
            if(name==='departments'){assert.equal(await page.locator('.fp-department-card').count(),12);assert.equal(await page.locator('.fp-department-card').first().evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(25, 28, 25)');}
            if(name==='experiences'){assert(await page.getByRole('link',{name:'Find mobile vendors serving today',exact:true}).isVisible());assert.equal(await page.locator('.fp-green-highlight').first().evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(232, 244, 223)');}
            if(name==='department-bakery'){
              assert.equal(await page.locator('.fp26-resultbar').getAttribute('data-type'),'bakery');
              assert(await page.getByRole('heading',{name:'Visual review fixture — bakery',exact:true}).isVisible());
              await page.locator('.fp26-filters input[name=q]').fill('visual');
              await page.locator('.fp26-filters button[type=submit]').click();
              await page.waitForURL(url=>url.pathname==='/explore/bakeries'&&url.searchParams.get('q')==='visual');
              await page.locator('#main-content .fp26-resultbar[data-query="visual"][data-type="bakery"]').waitFor();
              await page.locator('#main-content').getByRole('heading',{name:'Visual review fixture — bakery',exact:true}).first().waitFor();
            }
            if(name==='department-coffee'){assert.equal(await page.locator('.fp26-resultbar').getAttribute('data-type'),'cafe');assert(await page.getByRole('heading',{name:'Café Kumbuk',exact:true}).isVisible());}
            if(name==='department-produce'){assert.equal(await page.locator('.fp26-resultbar').getAttribute('data-kind'),'Produce');}
            if(name==='tradition-detail'){assert(await page.locator('.fp-culture-hero').isVisible());}
            if(['directory','food-products','discovery','dining','department-bakery','department-coffee','department-produce'].includes(name)){
              await page.waitForFunction(()=>{const forms=[...document.querySelectorAll('main .fp-taxonomy-filters')].filter(f=>f.getBoundingClientRect().width>0&&f.getBoundingClientRect().height>0);return forms.length===1;});
              const geometry=await page.locator('main .fp-taxonomy-filters select:visible').evaluateAll(nodes=>nodes.map(n=>{const r=n.getBoundingClientRect(),p=n.closest('label').getBoundingClientRect();return {name:n.name,w:r.width,h:r.height,parent:p.width,left:r.left-p.left,right:r.right-p.right}}));
              assert(geometry.length>0,'Missing taxonomy controls: '+name);
              assert(geometry.every(r=>r.w<=r.parent+1&&r.h>=44&&r.right<=1&&r.left>=-1),'Dropdown overflows its field or is too small: '+name+' '+width+' '+JSON.stringify(geometry));
            }
            if(name==='live'){
              await page.getByRole('heading',{name:'Visual review fixture — bakery'}).waitFor();
              assert.equal(await page.getByRole('link',{name:'Open GPS pin'}).count(),1);
              await page.getByRole('combobox',{name:'Vendor type'}).selectOption('coffee_cart');
              assert(await page.getByRole('heading',{name:'No matching serving stops yet.'}).isVisible());
              await page.getByRole('button',{name:'Clear filters'}).click();
              assert(await page.getByRole('heading',{name:'Visual review fixture — bakery'}).isVisible());
            }
            if(name==='atlas'){
              await page.locator('.fp-atlas-search input[name=q]').fill('කොත්තු');
              await page.locator('.fp-atlas-search button').click();
              await page.waitForURL(url=>url.pathname==='/food-atlas'&&url.searchParams.get('q')==='කොත්තු');
              await page.locator('#main-content [data-atlas-query="කොත්තු"][data-result-count="1"]').waitFor();
              assert.equal(await page.locator('#main-content .fp-atlas-card').count(),1);
              assert(await page.locator('#main-content').getByRole('heading',{name:'Kottu',exact:true}).isVisible());
            }
            if(name==='atlas-dish'){
              assert(await page.getByRole('heading',{name:'Kottu',exact:true}).isVisible());assert.equal(await page.locator('.fp-atlas-detail-photo').count(),0);
              await page.getByRole('button',{name:'Save',exact:true}).click();
              assert.equal(await page.getByRole('button',{name:'Saved',exact:true}).getAttribute('aria-pressed'),'true');
              const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('freshpick:saved-maker-picks')||'[]'));
              assert(stored.some(p=>p.href==='/food-atlas/kottu'));
              await page.getByRole('button',{name:'Saved',exact:true}).click();
              assert.equal(await page.getByRole('link',{name:'Find related dining discoveries'}).getAttribute('href'),'/eat-drink?q=kottu');
            }
            if(name==='item'){
              const details = page.locator('.lux-detail').first();
              await details.locator('summary').click();
              assert(!(await details.getAttribute('open')) && !(await details.evaluate(node=>node.open)),'Item accordion did not close');
              await details.locator('summary').click();
              assert(await details.evaluate(node=>node.open),'Item accordion did not open');
            }
            if(name==='contact'){
              assert.equal(await page.locator('.fp-contact-hero img').count(),1);
              assert.equal(await page.locator('.fp-contact-hero').evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(25, 28, 25)');
              await page.getByRole('textbox',{name:'Name',exact:true}).fill('Visual fixture');
              await page.getByRole('textbox',{name:'Email',exact:true}).fill('visual@example.invalid');
              await page.getByRole('textbox',{name:'Message',exact:true}).fill('Visual review only; not submitted.');
              assert(await page.getByRole('button',{name:'Send enquiry'}).isEnabled());
              assert.equal(await page.locator('.fp-contact-submit').evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(169, 219, 118)');
            }
            if(name==='maker-profile'){
              assert(await page.locator('.fp-business-logo').isVisible());
              assert(await page.locator('.fp-business-cover').isVisible());
              await page.getByRole('heading',{name:'Explore baked creations',exact:true}).waitFor();
              assert(await page.getByRole('heading',{name:'Enquire about your order',exact:true}).isVisible());
              const schemas=await page.locator('script[type="application/ld+json"]').evaluateAll(nodes=>nodes.map(n=>JSON.parse(n.textContent||'{}')));
              assert(schemas.some(s=>s['@type']==='ProfilePage'),'Missing public business profile schema');
            }
            if(name==='story'){assert(await page.locator('.fp-article-cover[alt="Test editorial image"]').isVisible());}
            if(name==='join'){
              const signupLink=page.getByRole('link',{name:'Create a free business account',exact:true});
              assert(await signupLink.isVisible());
              assert(await page.getByText('Free to get started.',{exact:true}).isVisible());
              assert.equal(await page.getByRole('combobox',{name:'Business type',exact:true}).count(),0);
              const target=new URL(await signupLink.getAttribute('href'),base);
              assert.equal(target.pathname,'/auth/signup/customer');
              assert.equal(target.searchParams.get('redirect'),'/dashboard/business-onboarding');
              await ready(page,new URL('/join?type=bakery&specialty=food-hampers',base).href);
              assert(await page.getByText('Showcase cakes, breads, pastries and custom bakes so customers can discover your creations.',{exact:true}).isVisible());
              const typedTarget=new URL(await page.getByRole('link',{name:'Create a free business account',exact:true}).getAttribute('href'),base);
              const next=new URL(typedTarget.searchParams.get('redirect'),base);
              assert.equal(next.pathname,'/dashboard/business-onboarding');
              assert.equal(next.searchParams.get('type'),'bakery');
              assert.equal(next.searchParams.get('specialty'),'food-hampers');
              await ready(page,new URL('/join?type=restaurant',base).href);
              assert(await page.getByText('Help diners discover your restaurant, menu, signature dishes and location.',{exact:true}).isVisible());
              await ready(page,new URL('/join',base).href);
            }
            if(name==='businesses'){
              assert(await page.getByRole('heading',{name:'Good food deserves to be discovered.',exact:true}).isVisible());
              assert(await page.getByRole('link',{name:'Get started for free',exact:true}).isVisible());
              assert.equal(await page.locator('.fp-business-type-card img').count(),3);
              await page.getByRole('button',{name:'Café',exact:true}).click();
              assert.equal(await page.getByRole('link',{name:'Create your business profile'}).getAttribute('href'),'/join?type=cafe');
            }
            if(name==='dining'){
              assert.equal(await page.locator('.fp-curated-entry').first().evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(25, 28, 25)');
              assert(await page.getByRole('heading',{name:'Useful reads',exact:true}).isVisible());
              assert.equal(await page.locator('.fp-directory-location input').getAttribute('list'),'directory-area-options');
              await page.getByRole('navigation',{name:'Business type'}).getByRole('link',{name:'Café',exact:true}).click();
              await page.waitForURL(url=>url.pathname==='/eat-drink'&&url.searchParams.get('type')==='cafe');
              assert(await page.getByRole('heading',{name:'Café Kumbuk',exact:true}).isVisible());
              assert.equal(await page.getByRole('heading',{name:'Ministry of Crab',exact:true}).count(),0);
            }
            if(name==='food-products'){
              await page.getByRole('combobox',{name:'Food category',exact:true}).selectOption('Drinks');
              await page.locator('.fp-brand-filters').getByRole('button',{name:'Search'}).click();
              await page.waitForURL(url=>url.pathname==='/food-products'&&url.searchParams.get('kind')==='Drinks');
              assert.equal(await page.getByRole('combobox',{name:'Food category',exact:true}).inputValue(),'Drinks');
            }
            if(name==='gifting'){assert(await page.getByRole('heading',{name:'Visual review fixture — bakery',exact:true}).isVisible());await page.getByRole('combobox',{name:'Business speciality',exact:true}).selectOption('food-hampers');await page.locator('.fp26-filters').getByRole('button',{name:'Search'}).click();await page.waitForURL(url=>url.pathname==='/gifting'&&url.searchParams.get('specialty')==='food-hampers');await page.getByRole('heading',{name:'Visual review fixture — bakery',exact:true}).waitFor();assert(await page.getByRole('heading',{name:'Visual review assortment',exact:true}).isVisible());await ready(page,new URL('/gifting',base).href);assert.equal(await page.getByText('Make the occasion special.',{exact:true}).count(),0);assert(await page.getByRole('heading',{name:'Gift ideas from local businesses'}).isVisible());}
            if(name==='discovery'){await page.getByRole('combobox',{name:'What are you looking for?',exact:true}).selectOption('dining');await page.locator('.fp26-filters input[name=q]').fill('coffee');await page.locator('.fp26-filters input[name=area]').fill('Colombo');await page.locator('.fp26-filters').getByRole('button',{name:'Search'}).click();await page.waitForURL(url=>url.pathname==='/eat-drink'&&url.searchParams.get('q')==='coffee'&&url.searchParams.get('area')==='Colombo');}
            if(name==='directory'){
              assert.equal(await page.locator('.fp-brand-switch').count(),0);
              assert(await page.getByRole('heading',{name:'Food products',exact:true}).isVisible());
              await page.getByRole('combobox',{name:'Food category',exact:true}).selectOption('Pantry');
              await page.getByRole('combobox',{name:'Business type',exact:true}).selectOption('food_brand');
              await page.locator('.fp-brand-filters').getByRole('button',{name:'Search'}).click();
              await page.waitForURL(url=>url.pathname==='/makers'&&url.searchParams.get('kind')==='Pantry'&&url.searchParams.get('type')==='food_brand',{waitUntil:'domcontentloaded'});
              await page.locator('#main-content .fp26-resultbar[data-kind="Pantry"][data-type="food_brand"]').waitFor();
              assert.equal(await page.getByRole('combobox',{name:'Food category',exact:true}).inputValue(),'Pantry');
              assert.equal(await page.getByRole('combobox',{name:'Business type',exact:true}).inputValue(),'food_brand');
              await page.locator('#main-content').getByRole('link',{name:'Clear filters',exact:true}).click();
              await page.waitForURL(url=>url.pathname==='/makers'&&![...url.searchParams.values()].some(Boolean),{waitUntil:'domcontentloaded'});
              await page.locator('#main-content .fp26-resultbar[data-kind=""][data-type=""]').waitFor();
              assert.equal(await page.getByRole('combobox',{name:'Food category',exact:true}).inputValue(),'');
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
            await page.getByRole('heading',{name:'Your business studio.'}).waitFor({timeout:20000});
            await page.getByRole('heading',{name:'Public profile'}).waitFor({timeout:20000});
            assert(await page.getByRole('checkbox',{name:'Food hampers',exact:true}).isVisible());
            assert(await page.getByRole('progressbar',{name:'Business page setup progress'}).isVisible());
            assert(await page.getByLabel('Upload business logo',{exact:true}).isVisible());
            assert(await page.getByLabel('Upload business cover photo',{exact:true}).isVisible());
            await capture(page,'maker-studio-'+width);
            await page.getByRole('button',{name:'Articles',exact:true}).click();
            assert(await page.getByLabel('Upload article cover image',{exact:true}).isVisible());
            assert(await page.getByLabel('Cover image description',{exact:true}).isVisible());
            await page.getByRole('textbox',{name:'Article body',exact:true}).fill('A fictional article draft.');
            await page.getByRole('button',{name:'Heading',exact:true}).click();
            await page.getByRole('button',{name:'Preview article',exact:true}).click();
            assert(await page.locator('[aria-label="Article preview"]').isVisible());
            await page.getByRole('button',{name:'Back to editing',exact:true}).click();
            assert((await page.getByRole('textbox',{name:'Article body',exact:true}).inputValue()).includes('## '));
            await capture(page,'maker-editor-'+width);
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
              await page.getByRole('heading',{name:'Food & brands',exact:true}).waitFor();
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
    if(process.env.FRESHPICK_VISUAL_FIXTURES==='1'){
      const context=await browser.newContext({viewport:{width:390,height:844}});
      try{
        const endpoint=new URL('/api/admin/discovery-content',base).href;
        assert.equal((await context.request.get(endpoint)).status(),401);
        const login=await context.request.post(new URL('/api/auth/login',base).href,{data:{identifier:'visual-admin@example.invalid',password:process.env.VISUAL_PASSWORD}});
        assert(login.ok(),'CMS admin fixture login failed');
        const page=await context.newPage();
        await ready(page,new URL('/admin',base).href);
        await page.getByRole('heading',{name:'Discovery control centre.'}).waitFor({timeout:20000});
        await page.getByText('Account & delivery health',{exact:true}).waitFor();
        await capture(page,'admin-discovery-overview-390');
        await ready(page,new URL('/admin/discovery-content',base).href);
        await page.getByRole('heading',{name:'Food & Culture CMS'}).waitFor({timeout:20000});
        await page.getByRole('button',{name:/Kottu/}).waitFor();
        await capture(page,'admin-discovery-cms-390');
        const write=async(url,method,data)=>page.evaluate(async({url,method,data})=>{const r=await fetch(url,{method,credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});return {status:r.status,ok:r.ok,body:await r.json().catch(()=>null)};},{url,method,data});
        const content={kind:'event',slug:'visual-cms-lifecycle',title:'CMS lifecycle fixture '+Date.now(),category:'Workshop',summary:'Private draft test',body:'Private event body '+Date.now(),aliases:[],variations:[],relatedDishes:[],searchTerm:'',sourceUrl:'https://example.org/fixture',sourceName:'Test fixture',location:'Test venue',startsAt:new Date(Date.now()+86400000).toISOString(),endsAt:new Date(Date.now()+90000000).toISOString(),published:false,confirmed:false};
        const created=await write(endpoint,'POST',content);assert.equal(created.status,201,JSON.stringify(created.body));
        const draft=created.body.record;
        const publicUrl=new URL('/experiences/events/'+content.slug,base).href;
        // Next.js can send 200 for a streamed notFound() response. Assert actual
        // anonymous visibility, noindex and absence of the private payload.
        const eventGuest=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
        try{
          const visitor=await eventGuest.newPage();
          const expectPrivate=async(label)=>{
            const response=await visitor.goto(publicUrl,{waitUntil:'networkidle'});
            assert(response&&[200,404].includes(response.status()),label+': unexpected HTTP status '+response?.status());
            await visitor.locator('#main-content h1#not-found-title').waitFor({state:'visible'});
             assert.equal(await visitor.locator('#main-content h1#not-found-title').textContent(),'A little off the food trail.');
            assert.equal(await visitor.locator('#main-content').getByText(content.title,{exact:true}).count(),0,label+': private title rendered');
            assert.equal(await visitor.locator('#main-content').getByText(content.body,{exact:true}).count(),0,label+': private body rendered');
            const html=await response.text();
            assert(!html.includes(content.title)&&!html.includes(content.body),label+': private payload present in HTML');
            assert(await visitor.locator('meta[name="robots"]').evaluateAll(nodes=>nodes.some(n=>n.getAttribute('content')?.includes('noindex'))),label+': missing noindex');
            const sitemap=await eventGuest.request.get(new URL('/sitemap.xml',base).href);
            assert(sitemap.ok(),label+': sitemap unavailable');
            assert(!(await sitemap.text()).includes('/experiences/events/'+content.slug),label+': private URL present in sitemap');
          };
          await expectPrivate('Draft must not be public');
          const published=await write(endpoint,'PATCH',{id:draft.id,version:draft.updatedAt,content:{...content,published:true,confirmed:true}});assert(published.ok,'Publish failed: '+JSON.stringify(published.body));
          const live=published.body.record;
          const response=await visitor.goto(publicUrl,{waitUntil:'networkidle'});
          assert(response?.ok(),'Published event must be public');
          await visitor.locator('#main-content').getByRole('heading',{name:content.title,exact:true}).waitFor();
          assert(await visitor.locator('#main-content').getByText(content.body,{exact:true}).isVisible(),'Published event body missing');
          const stale=await write(endpoint,'PATCH',{id:draft.id,version:draft.updatedAt,content});assert.equal(stale.status,409);
          const hidden=await write(endpoint,'PATCH',{id:live.id,version:live.updatedAt,content});assert(hidden.ok,'Unpublish failed: '+JSON.stringify(hidden.body));
          await expectPrivate('Unpublished event must be hidden');
        }finally{await eventGuest.close();}
        const pageEndpoint=new URL('/api/admin/site-pages',base).href;
        const pageData=await page.evaluate(async url=>(await (await fetch(url,{credentials:'same-origin'})).json()),pageEndpoint);
        const initial=pageData.pages.find(p=>p.key==='home');
        assert(initial,'Home CMS configuration missing');
        const changed={...initial.config,title:'CMS private draft fixture '+Date.now()};
        const guest=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
        const {PrismaClient}=await import('@prisma/client');
        const db=new PrismaClient();
        let version=initial.version;
        try{
          const publicPage=await guest.newPage();
          await ready(publicPage,new URL('/',base).href);
          // Reproduce the real returning-visitor path with an active worker, not a bypassed cache.
          await publicPage.evaluate(()=>navigator.serviceWorker.ready);
          await publicPage.waitForFunction(()=>Boolean(navigator.serviceWorker.controller));
          await ready(publicPage,new URL('/',base).href);
          const original=await publicPage.locator('#main-content #home-headline').innerText();
          const saved=await write(pageEndpoint,'PATCH',{key:'home',version,config:changed,action:'draft'});assert(saved.ok,'Page draft failed: '+JSON.stringify(saved.body));version=saved.body.page.version;
          const stored=await db.sitePageContent.findUniqueOrThrow({where:{key:'home'}});
          assert.equal(stored.draft.title,changed.title,'Draft must be saved');
          assert.notEqual(stored.live.title,changed.title,'Draft must not overwrite published JSON');
          const response=await guest.request.get(new URL('/',base).href,{headers:{'Cache-Control':'no-cache'}});
          assert(response.ok(),'Guest homepage failed');
          assert(!(await response.text()).includes(changed.title),'Draft must not be in anonymous response');
          await ready(publicPage,new URL('/',base).href);
          assert.equal(await publicPage.locator('#home-headline').innerText(),original,'Draft must not change public headline');
          const publishedPage=await write(pageEndpoint,'PATCH',{key:'home',version,config:changed,action:'publish'});assert(publishedPage.ok,'Page publish failed: '+JSON.stringify(publishedPage.body));version=publishedPage.body.page.version;
          const publishedRow=await db.sitePageContent.findUniqueOrThrow({where:{key:'home'}});
          assert.equal(publishedRow.live.title,changed.title,'Publish must persist live headline');
          assert(publishedRow.publishedAt,'Publish timestamp missing');
          const publishedHtml=await guest.request.get(new URL('/',base).href,{headers:{'Cache-Control':'no-cache'}});
          assert(publishedHtml.ok()&&(await publishedHtml.text()).includes(changed.title),'Published headline missing from server response');
          await ready(publicPage,new URL('/',base).href);
          await publicPage.locator('#main-content').getByRole('heading',{name:changed.title,exact:true}).waitFor({timeout:15000});
          assert.equal(await publicPage.locator('#main-content #home-headline').innerText(),changed.title,'Published headline missing with active service worker');
          const pageCache=await publicPage.evaluate(async()=>{const keys=await caches.keys();const entries=await Promise.all(keys.filter(k=>k.startsWith('freshpick-')).map(async key=>(await (await caches.open(key)).keys()).map(r=>new URL(r.url))));return entries.flat().some(url=>url.pathname==='/'||url.searchParams.has('_rsc'));});
          assert(!pageCache,'CMS documents or RSC payloads must not be stored in Cache Storage');
        }finally{
          try{if(version!==initial.version){const restored=await write(pageEndpoint,'PATCH',{key:'home',version,config:initial.config,action:'publish'});assert(restored.ok,'Restore fixture page failed');}}finally{await guest.close();await db.$disconnect();}
        }
      }catch(error){errors.push('CMS lifecycle: '+(error instanceof Error?error.stack||error.message:String(error)));}finally{await context.close();}
    }
    const reduced=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
    try{
      const page=await reduced.newPage();
      await ready(page,new URL('/',base).href);
      assert.equal(await page.locator('main').getAttribute('data-studio-motion'),null,'Reduced motion must not activate GSAP');
      assert(await page.locator('#home-headline').isVisible(),'Headline must remain visible');
      await capture(page,'reduced-motion-homepage-390');
    }catch(error){errors.push(String(error));}finally{await reduced.close();}
  }finally{await browser.close();}
  if(errors.length)throw new Error(errors.join('\n'));
}
main().catch(error=>{console.error(error);process.exitCode=1;});
