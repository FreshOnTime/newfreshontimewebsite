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
 expect(new Set(foodDepartments.map(d=>departmentPath(d.slug))).size).toBe(9);
 expect(getDepartment('coffee-cafes')).toMatchObject({type:'cafe',mode:'dining'});
 expect(getDepartment('produce')).toMatchObject({kind:'Produce'});
 expect(getDepartment('food-gifts')).toMatchObject({mode:'gifting'});
 expect(getDepartment('unknown')).toBeUndefined();
});
