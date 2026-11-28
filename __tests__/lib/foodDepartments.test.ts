import {foodDepartments,getDepartment,departmentPath,nationwideArea} from '@/lib/foodDepartments';
import {directoryMetadata} from '@/lib/seo';
it('treats Sri Lanka as the nationwide default without losing specific towns',()=>{
 expect(nationwideArea('Sri Lanka')).toBe('');
 expect(nationwideArea(' ALL OF SRI LANKA ')).toBe('');
 expect(nationwideArea(' Kandy ')).toBe('Kandy');
 expect(nationwideArea(['Colombo'])).toBe('');
 expect(directoryMetadata('/discover','Discover','Food',{area:'Sri Lanka'}).robots).toBeUndefined();
 expect(directoryMetadata('/discover','Discover','Food',{area:'Kandy'}).robots).toMatchObject({index:false});
});
it('defines unique dedicated department routes and explicit business filters',()=>{
 expect(new Set(foodDepartments.map(d=>departmentPath(d.slug))).size).toBe(foodDepartments.length);
 expect(foodDepartments).toHaveLength(12);
 expect(getDepartment('groceries')).toMatchObject({type:'grocery'});
 expect(getDepartment('farms')).toMatchObject({type:'farm'});
 expect(getDepartment('mobile-food')).toMatchObject({type:'mobile_food'});
 expect(getDepartment('coffee-cafes')).toMatchObject({type:'cafe',mode:'dining'});
 expect(getDepartment('produce')).toMatchObject({kind:'Produce'});
 expect(getDepartment('food-gifts')).toMatchObject({mode:'gifting'});
 expect(getDepartment('unknown')).toBeUndefined();
});
