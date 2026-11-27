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
 expect(read('app/makers/page.tsx')).toContain("listProspects('makers'");
});
