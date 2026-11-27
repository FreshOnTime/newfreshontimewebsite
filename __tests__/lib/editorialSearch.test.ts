import {editorialArticle,editorialFeed,xmlText} from '@/lib/editorialSearch';
import {absoluteUrl} from '@/lib/config/site';
const date=new Date('2026-11-27T00:00:00Z');
const entry={path:'/food-atlas/hoppers',title:'Hoppers',summary:'Rice & coconut <milk>',publishedAt:date,updatedAt:date,sourceUrl:'https://example.org/food',aliases:['appa','ආප්ප','ஆப்பம்'],category:'Breakfast'};
it('uses the same actual editorial dates, aliases and citation without fabricating an author',()=>{const a=editorialArticle(entry);expect(a).toMatchObject({datePublished:date.toISOString(),dateModified:date.toISOString(),citation:entry.sourceUrl,author:{url:absoluteUrl('/editorial-policy')},about:{alternateName:entry.aliases},publisher:{'@id':absoluteUrl('/#organization')}});});
it('does not invent dates for undated field notes',()=>{expect(editorialArticle({path:'/stories/one',title:'One',summary:'Story'})).not.toHaveProperty('datePublished');});
it('escapes XML in feeds and preserves canonical URLs and real publication dates',()=>{const xml=editorialFeed([entry]);expect(xml).toContain('Rice &amp; coconut &lt;milk&gt;');expect(xml).toContain(absoluteUrl(entry.path));expect(xml).toContain(date.toUTCString());expect(xmlText('a\u0000&b')).toBe('a&amp;b');});
