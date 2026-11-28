export const businessTypes=['maker','restaurant','cafe','bakery','caterer','food_brand','gift_creator','grocery','farm','mobile_food','other'] as const;
export type BusinessType=typeof businessTypes[number];
// Retain the legacy stored value for compatibility, but do not offer it to new businesses.
export const selectableBusinessTypes=businessTypes.filter(type=>type!=='gift_creator');
export const diningBusinessTypes=['restaurant','cafe','bakery','caterer'] as const;
export const venueOnlyTypes=['restaurant','cafe'] as const;
export const businessTypeLabels:Record<BusinessType,string>={maker:'Homemade & artisan food',restaurant:'Restaurant',cafe:'Café',bakery:'Bakery',caterer:'Catering services',food_brand:'Food brand',gift_creator:'Food business (legacy)',grocery:'Grocery & speciality store',farm:'Farm & fresh produce',mobile_food:'Food truck & pop-up',other:'Other food business'};
export const businessTypeDetails:Record<BusinessType,{description:string;examples:string}> = {
 restaurant:{description:'A place serving prepared meals, dine-in or takeaway.',examples:'Restaurants, rice and curry shops, dining venues'},
 cafe:{description:'A venue centred on coffee, tea, drinks and light meals.',examples:'Coffee shops, tea rooms, dessert cafés'},
 bakery:{description:'A business making baked goods and custom cakes.',examples:'Home bakeries, bread shops, pastry kitchens'},
 food_brand:{description:'A business selling products under its own food brand, whether small or large.',examples:'Packaged tea, sauces, spices, snacks'},
 maker:{description:'An independent producer making homemade or small-batch speciality food.',examples:'Homemade pickles, jams, artisan treats'},
 grocery:{description:'A shop selling groceries or ingredients from multiple producers.',examples:'Grocery shops, organic stores, speciality food retailers'},
 farm:{description:'A grower or farm selling fresh ingredients or farm products.',examples:'Fruit and vegetable growers, dairy farms, organic farms'},
 caterer:{description:'A food service business preparing meals for events or groups.',examples:'Wedding catering, corporate meals, private events'},
 mobile_food:{description:'A mobile or temporary food business serving at changing locations.',examples:'Food trucks, market stalls, pop-up kitchens'},
 other:{description:'A food business that does not primarily fit the other options.',examples:'Other food-related businesses'},
 gift_creator:{description:'An existing business classification retained for compatibility.',examples:'Food gifts can be listed by any business'}
};
export function businessTypeLabel(value:string|null|undefined){return businessTypeLabels[value as BusinessType]||'Independent food business'}
export function isDiningBusiness(value:string|null|undefined){return diningBusinessTypes.some(type=>type===value)}
export function isVenueOnly(value:string|null|undefined){return venueOnlyTypes.some(type=>type===value)}
export function officialHttps(value:string|null|undefined,host?:string){if(!value)return undefined;try{const u=new URL(value);if(u.protocol!=='https:'||u.username||u.password)return undefined;if(host&&u.hostname!==host&&!u.hostname.endsWith('.'+host))return undefined;return u.href}catch{return undefined}}
