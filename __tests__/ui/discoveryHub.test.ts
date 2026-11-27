import {readFileSync} from 'node:fs';
const read=(p:string)=>readFileSync(p,'utf8');
it('shares canonical articles and only displays configured social links',()=>{
 expect(read('components/layout/Footer.tsx')).toContain('socials.length>0');
 expect(read('components/layout/Footer.tsx')).toContain('Follow FreshPick');
 expect(read('app/stories/[slug]/page.tsx')).toContain('url={absoluteUrl(notePath(note))}');
 expect(read('app/makers/[handle]/stories/[slug]/page.tsx')).toContain('<ShareDiscovery');
 expect(read('components/discovery/ShareDiscovery.tsx')).toContain('navigator.share');
});
it('honors dining business-type filters for menu results and separates business stories',()=>{
 expect(read('components/discovery/Directory.tsx')).toContain('venueOnlyTypes.filter(t=>!type||t===type)');
 expect(read('app/stories/page.tsx')).toContain("businessOnly=topic==='businesses'");
 expect(read('app/stories/page.tsx')).toContain('(!topic||businessOnly)?await prisma.blog.findMany');
});
