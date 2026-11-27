import {readFileSync} from 'node:fs';
import {fieldNotes} from '@/lib/fieldNotes';
const read=(p:string)=>readFileSync(p,'utf8');
it('uses real reading guides on sparse directories and removes the duplicate homepage promotion shelf',()=>{
 expect(new Set(fieldNotes.map(n=>n.slug)).size).toBe(fieldNotes.length);
 for(const slug of ['a-table-for-two','the-price-on-the-jar','a-gift-worth-opening']){
  const note=fieldNotes.find(n=>n.slug===slug);
  expect(note?.sections.length).toBeGreaterThanOrEqual(3);
 }
 expect(read('components/discovery/Directory.tsx')).toContain('<GuideShelf');
 expect(read('app/page.tsx')).not.toContain('journal-first-note');
 expect(read('app/page.tsx')).not.toContain('studio-method');
 expect(read('app/page.tsx')).toContain('prospects.length>0');
 expect(read('app/makers/page.tsx')).toContain('mode="makers"');
});

it('uses a common publication shell, editorial typography and compact sparse states',()=>{
 expect(read('components/layout/AdminChromeGuard.tsx')).toContain('data-publication');
 expect(read('app/discovery.css')).toContain('--fp-serif:"Instrument Serif"');
 expect(read('components/makers/Edition.tsx')).toContain('<EditorialHeader');
 expect(read('components/discovery/Directory.tsx')).toContain('Promise.allSettled');
 expect(read('app/stories/page.tsx')).toContain('Journal topics');
 expect(read('app/for-businesses/page.tsx')).toContain('<BusinessExplorer/>');
});

it('keeps products separate from businesses and restaurants in the new discovery experience',()=>{
 const directory=read('components/discovery/Directory.tsx');
 // Product results must never include imported business profiles or external editorial selections.
 expect(directory).toMatch(/mode\s*===\s*['"]products['"]\s*\?\s*Promise\.resolve\(\[\]\s+as\s+PublicProspect\[\]\)\s*:\s*listProspects\(/);
 expect(directory).toMatch(/const showEditorial\s*=.*mode\s*!==\s*['"]products['"]/);
 expect(directory).toContain('Menu discoveries');
 expect(directory).toContain('businessType:{notIn:[...venueOnlyTypes]}');
 expect(directory).toContain("mode==='all'?prisma.blog.findMany");
 expect(read('components/discovery/BusinessExplorer.tsx')).toContain('/join?type=');
 expect(read('components/makers/MakerStudio.tsx')).toContain('Publish article in the journal');
 expect(read('components/discovery/GiftPlanner.tsx')).toContain('Copy enquiry');
});

it('makes gifting and contact paths prominent without the repeated homepage navigation',()=>{const home=read('app/page.tsx');expect(home).toContain('<GiftFeature/>');expect(home).toContain('<ConnectShelf/>');expect(home).not.toContain('<DiscoveryRail/>');expect(home).toContain('<EditorialPicks group="dining" feature/>');expect(read('components/discovery/Curated.tsx')).toContain('Not FreshPick partners');});

it('loads the premium public finish without changing admin chrome',()=>{expect(read('app/layout.tsx')).toContain('import "./discovery-polish.css"');expect(read('components/layout/AdminChromeGuard.tsx')).toContain('publication||authentication?"tasting-room":undefined');const css=read('app/discovery.css');for(const value of ['#F8F5EE','#244539','#49362B','--fp-r-image:16px','--fp-r-panel:24px'])expect(css).toContain(value);expect(read('app/discovery-polish.css')).toContain('prefers-reduced-motion');});
