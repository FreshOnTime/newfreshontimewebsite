import {editorialDiscoveries,editorialMatches} from '@/lib/editorialDiscoveries';
it('returns genuine external editorial references, not account IDs or availability',()=>{
 expect(new Set(editorialDiscoveries.map(x=>x.id)).size).toBe(editorialDiscoveries.length);
 expect(editorialMatches('dining')).toHaveLength(3);
 expect(editorialMatches('gifting')).toHaveLength(4);
 expect(editorialMatches('dining','cafe').map(x=>x.id)).toContain('cafe-kumbuk');
 expect(editorialMatches('dining','xyz-no-match')).toHaveLength(0);
 for(const entry of editorialDiscoveries){expect(new URL(entry.url).protocol).toBe('https:');expect(entry).not.toHaveProperty('rating');expect(entry).not.toHaveProperty('availability');}
});
it('matches café and restaurant quick filters and food makers separately',()=>{expect(editorialMatches('dining','','','cafe')).toHaveLength(2);expect(editorialMatches('dining','','','restaurant')).toHaveLength(1);expect(editorialMatches('makers')).toHaveLength(3);expect(editorialMatches('dining','','Galle')).toHaveLength(0);});
