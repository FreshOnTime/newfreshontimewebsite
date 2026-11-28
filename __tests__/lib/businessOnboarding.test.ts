import { canonicalSpecialties,offeringsSchema,suggestionsFor,isBusinessApplicant } from '@/lib/businessOnboarding';
it('maps granular bakery labels to canonical categories',()=>{
 const values=suggestionsFor('bakery').filter(x=>['Birthday cakes','Wedding cakes','Bread'].includes(x.label));
 expect(canonicalSpecialties(values)).toEqual(['cakes-desserts','bread-pastries']);
});
it('retains custom labels without inventing categories',()=>{
 const parsed=offeringsSchema.parse([{label:'Vegan brownies',category:null},{label:'vegan brownies',category:null}]);
 expect(parsed).toHaveLength(1);expect(canonicalSpecialties(parsed)).toEqual([]);
});
it('rejects invalid canonical IDs and blocks primary and secondary admin roles',()=>{
 expect(offeringsSchema.safeParse([{label:'Cake',category:'invented'}]).success).toBe(false);
 expect(isBusinessApplicant('admin')).toBe(false);
 expect(isBusinessApplicant('customer',['admin'])).toBe(false);
 expect(isBusinessApplicant('customer')).toBe(true);
});
