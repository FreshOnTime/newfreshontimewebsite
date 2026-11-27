import {readFileSync} from 'node:fs';
const read=(path:string)=>readFileSync(path,'utf8');
it('loads mobile overrides after the public design and avoids blanket horizontal clipping',()=>{
 const layout=read('app/layout.tsx');expect(layout.indexOf('discovery-mobile.css')).toBeGreaterThan(layout.indexOf('discovery-polish.css'));
 const css=read('app/discovery-mobile.css');expect(css).toContain('@media(max-width:359px)');expect(css).toContain('min-width:44px');expect(css).toContain('font-size:16px');expect(css).not.toMatch(/overflow-x:\s*(hidden|clip)/);
});
it('uses a phone-width search action and moves auth fields ahead of promotional content',()=>{
 expect(read('components/discovery/ExploreSearch.tsx')).toContain('fp-mobile-search-label');
 expect(read('components/layout/AuthFrame.tsx')).toContain('fp-auth-fields');
 const css=read('app/discovery-mobile.css');expect(css).toContain('.fp-auth-fields{order:-1');expect(css).toContain('grid-row:3;width:100%');
});
it('covers small and large phone sizes with touch-enabled browser checks',()=>{
 const review=read('scripts/visual-review.mjs');expect(review).toContain('[320,390,430,768,1440]');expect(review).toContain('hasTouch:true');expect(review).toContain('checkMobile(page');expect(review).toContain('Horizontal overflow:');
});

it('includes one Contact link in the shared desktop and mobile navigation',()=>{const nav=read('components/layout/Navbar.tsx');expect(nav).toContain('{label:"Contact",href:"/contact"}');expect(nav).not.toContain('moreLinks');expect(nav).toContain('links.map');expect(nav).toContain('[...links,...cultureLinks,{label:"Saved picks"');expect(nav.match(/href:"\/contact"/g)).toHaveLength(1);expect(nav).toContain('Journal and food culture');});
