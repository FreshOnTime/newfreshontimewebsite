import { z } from 'zod';
import { businessSpecialties, type BusinessSpecialty } from './businessSpecialties';
import { businessTypes, type BusinessType } from './businessTypes';
const s=(label:string,category:BusinessSpecialty)=>({label,category});
const gifts=[s('Food hampers','food-hampers'),s('Corporate gifts','corporate-gifts'),s('Wedding favours','wedding-favours'),s('Custom food gifts','custom-food-gifts')];
const suggestions:Record<BusinessType,ReturnType<typeof s>[]> = {
 bakery:[s('Birthday cakes','cakes-desserts'),s('Wedding cakes','cakes-desserts'),s('Cupcakes','cakes-desserts'),s('Brownies','cakes-desserts'),s('Bread','bread-pastries'),s('Pastries','bread-pastries'),s('Cookies','bread-pastries')],
 restaurant:[s('Sri Lankan cuisine','prepared-meals'),s('Indian cuisine','prepared-meals'),s('Asian cuisine','prepared-meals'),s('Seafood','prepared-meals'),s('Vegetarian meals','prepared-meals'),s('Fast food','prepared-meals')],
 cafe:[s('Coffee','tea-coffee'),s('Tea','tea-coffee'),s('Matcha','tea-coffee'),s('Smoothies','drinks'),s('Desserts','cakes-desserts'),s('Light meals','prepared-meals')],
 food_brand:[s('Tea','tea-coffee'),s('Coffee','tea-coffee'),s('Spices','pantry-specialities'),s('Sauces','pantry-specialities'),s('Packaged snacks','pantry-specialities'),s('Chocolate','chocolate-confectionery'),s('Beverages','drinks'),s('Dairy products','pantry-specialities')],
 maker:[s('Homemade meals','prepared-meals'),s('Pickles','pantry-specialities'),s('Jams','pantry-specialities'),s('Sweets','chocolate-confectionery'),s('Short eats','prepared-meals')],
 grocery:[s('Groceries','pantry-specialities'),s('Organic ingredients','pantry-specialities'),s('Fresh vegetables','fresh-produce'),s('Imported foods','pantry-specialities')],
 farm:[s('Vegetables','fresh-produce'),s('Fruit','fresh-produce'),s('Herbs','fresh-produce'),s('Eggs','pantry-specialities'),s('Dairy','pantry-specialities')],
 caterer:[s('Wedding catering','event-catering'),s('Corporate catering','event-catering'),s('Private events','event-catering'),s('Meal packages','prepared-meals')],
 mobile_food:[s('Street food','prepared-meals'),s('Burgers','prepared-meals'),s('Drinks','drinks'),s('Desserts','cakes-desserts')],
 other:[s('Food products','pantry-specialities'),s('Prepared meals','prepared-meals')],gift_creator:[]};
export function suggestionsFor(type:BusinessType){return [...suggestions[type],...gifts];}
export const businessNameSchema=z.string().trim().min(1).max(150);
export const offeringSchema=z.object({label:z.string().trim().min(2).max(60).regex(/^[\p{L}\p{N}][\p{L}\p{N}\p{M} &+.,'’()/-]*$/u,'Use a short food-related label'),category:z.enum(businessSpecialties).nullable()});
export type Offering=z.infer<typeof offeringSchema>;
export const offeringsSchema=z.array(offeringSchema).max(8).transform(items=>items.filter((x,i)=>items.findIndex(y=>y.label.toLowerCase()===x.label.toLowerCase())===i));
export const onboardingDraftSchema=z.object({name:businessNameSchema.optional(),type:z.enum(businessTypes).optional(),offerings:offeringsSchema.optional(),town:z.string().trim().max(100).optional(),phone:z.string().trim().max(30).optional(),step:z.union([z.literal(2),z.literal(3)]).optional()}).strict();
export function canonicalSpecialties(offerings:Offering[]){return [...new Set(offerings.flatMap(x=>x.category?[x.category]:[]))];}
export function isBusinessApplicant(role:string,secondaryRoles:readonly string[]=[]){return ['customer','supplier'].includes(role)&&!secondaryRoles.some(r=>r!=='customer'&&r!=='supplier');}
