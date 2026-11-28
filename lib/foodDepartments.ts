import type {BusinessType} from './businessTypes';
import type {DiscoveryMode} from './discovery';
export type FoodDepartment={slug:string;title:string;description:string;image:string;mode:DiscoveryMode;type?:BusinessType;kind?:string;note:string};
export const foodDepartments:readonly FoodDepartment[]=[
 {slug:'places',title:'Places to eat',description:'Discover restaurants, cafés, bakeries and dining experiences across Sri Lanka.',image:'/images/editorial/restaurant-kitchen.webp',mode:'dining',note:'Explore menus and contact venues directly to confirm details.'},
 {slug:'coffee-cafes',title:'Coffee & cafés',description:'Find independent cafés, coffee spots and their signature drinks.',image:'/images/categories/beverages.webp',mode:'dining',type:'cafe',note:'Ask about brewing styles, opening hours and seating.'},
 {slug:'restaurants',title:'Restaurants',description:'Explore Sri Lankan restaurants, local flavours and dining menus.',image:'/images/categories/cooked-food.webp',mode:'dining',type:'restaurant',note:'Confirm current menus, availability and reservations with each venue.'},
 {slug:'bakeries',title:'Bakeries',description:'Discover artisan bread, pastries, cakes and the businesses behind them.',image:'/images/categories/bakery.webp',mode:'all',type:'bakery',note:'Ask bakers about flavours, sizes, custom creations and collection.'},
 {slug:'caterers',title:'Caterers',description:'Explore catering businesses for celebrations, office meals and special occasions.',image:'/images/editorial/restaurant-kitchen.webp',mode:'all',type:'caterer',note:'Discuss guest numbers, dietary needs and dates directly with the caterer.'},
 {slug:'produce',title:'Fresh produce',description:'Discover fresh ingredients and produce offerings from local food businesses.',image:'/images/editorial/kitchen-basket.webp',mode:'all',kind:'Produce',note:'Ask producers about seasonal availability and collection or delivery.'},
 {slug:'food-brands',title:'Food brands',description:'Meet independent brands and explore their speciality food products.',image:'/images/editorial/recipe-ingredients.webp',mode:'all',type:'food_brand',note:'Discover the products, ingredients and stories behind each brand.'},
 {slug:'makers',title:'Homemade & artisan food',description:'Discover homemade foods and small-batch artisan producers in Sri Lanka.',image:'/images/editorial/hands-at-work.webp',mode:'makers',type:'maker',note:'Contact makers directly for availability and custom orders.'},
 {slug:'groceries',title:'Grocery & speciality stores',description:'Find grocery shops, speciality retailers and ingredients from different producers.',image:'/images/categories/pantry-staples.webp',mode:'all',type:'grocery',note:'Check prices and stock directly with the store.'},
 {slug:'farms',title:'Farms & fresh produce',description:'Discover growers, farms and farm-direct ingredients across Sri Lanka.',image:'/images/editorial/kitchen-basket.webp',mode:'all',type:'farm',note:'Confirm seasonal availability and any certification claims directly.'},
 {slug:'mobile-food',title:'Food trucks & pop-ups',description:'Find mobile food businesses, market stalls and pop-up kitchens.',image:'/images/editorial/restaurant-kitchen.webp',mode:'all',type:'mobile_food',note:'Check serving times and locations directly or explore FreshPick Live.'},
 {slug:'food-gifts',title:'Food gifts',description:'Discover thoughtful hampers, celebration gifts and gifts from any food business.',image:'/images/categories/pantry-staples.webp',mode:'gifting',note:'Confirm quantities, personalisation and deadlines directly with the business.'}
];
export const departmentPath=(slug:string)=>'/explore/'+slug;
export const getDepartment=(slug:string)=>foodDepartments.find(d=>d.slug===slug);
export function nationwideArea(value:unknown){const area=typeof value==='string'?value.trim().slice(0,100):'';return /^(?:all of )?sri lanka$/i.test(area)?'':area;}
