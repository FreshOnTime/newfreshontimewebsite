import {businessPresentation,businessDescription,businessJsonLd,businessSetup} from '@/lib/businessPresentation';
import {serializeJsonLd} from '@/lib/seo';
it('uses distinct discovery and contact paths for dining, bakers, and gift businesses',()=>{
 expect(businessPresentation('restaurant')).toMatchObject({directory:'/eat-drink',navigation:'Menu'});
 expect(businessPresentation('bakery')).toMatchObject({directory:'/makers',navigation:'Baked creations'});
 expect(businessPresentation('gift_creator')).toMatchObject({directory:'/gifting',navigation:'Gift collections'});
 expect(businessPresentation('caterer').contact).toBe('Discuss your occasion');
 expect(businessPresentation('unknown').navigation).toBe('Products');
});
it('includes category, town and specialities in a concise metadata description',()=>{
 const b={name:'Example',makerHandle:'example',businessType:'bakery',makerTown:'Colombo',businessSpecialties:['food-hampers'],makerBio:'a'.repeat(200)};
 expect(businessDescription(b)).toContain('Bakery · Colombo · Food hampers');
 expect(businessDescription(b).length).toBeLessThanOrEqual(155);
});
it('emits truthful public profile data without fake ratings, addresses or unsafe links',()=>{
 const schema=businessJsonLd({name:'Example </script>',makerHandle:'example',makerTown:'Colombo',businessWebsite:'javascript:alert(1)',businessInstagram:'https://instagram.com/example'});
 expect(schema).toMatchObject({'@type':'ProfilePage',mainEntity:{'@type':'Organization',name:'Example </script>',location:{name:'Colombo'},sameAs:['https://instagram.com/example']}});
 expect(schema.mainEntity).not.toHaveProperty('aggregateRating');
 expect(schema.mainEntity).not.toHaveProperty('address');
 expect(serializeJsonLd(schema)).not.toMatch(/[<>&]/);
});
it('does not count draft offerings or stories as completed publishing steps',()=>{
 const initial=businessSetup({makerHandle:'example',makerTown:'Colombo',makerWhatsApp:'+94123456789',makerPublished:false},0,0);
 expect(initial.filter(s=>s.complete).map(s=>s.key)).toEqual(['identity','contact']);
 expect(businessSetup({makerHandle:'example',makerBio:'Our story',makerTown:'Colombo',makerWhatsApp:'+94123456789',businessSpecialties:['food-hampers'],makerPublished:true},1,1).every(s=>s.complete)).toBe(true);
});
