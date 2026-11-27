import {readFileSync} from 'node:fs';
const read=(p:string)=>readFileSync(p,'utf8');
it('keeps CMS writes admin-only and public content publication-gated',()=>{
 const api=read('app/api/admin/discovery-content/route.ts');
 expect(api).toContain('GET=requireAdminSimple');expect(api).toContain('POST=requireAdminSimple');expect(api).toContain('PATCH=requireAdminSimple');expect(api.match(/validateOrigin\(request\)/g)).toHaveLength(2);
 expect(api).toContain('updatedAt:new Date(version)');
 expect(read('lib/discoveryContent.ts')).toContain('published:true,publishedAt:{not:null}');
 expect(read('lib/discoveryContent.ts')).toContain('endsAt:{gte:new Date()}');
 expect(read('app/food-atlas/[slug]/page.tsx')).toContain('await getPublishedDishes()');
 expect(read('components/admin/AdminSidebar.tsx')).toContain('/admin/discovery-content');
 expect(read('app/sitemap.ts')).toContain('where:publishedContentWhere');
});
