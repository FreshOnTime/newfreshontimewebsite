export const businessTypes=['maker','restaurant','cafe','bakery','caterer','food_brand','gift_creator','other'] as const;
export type BusinessType=typeof businessTypes[number];
// Retain the legacy stored value for compatibility, but do not offer it to new businesses.
export const selectableBusinessTypes=businessTypes.filter(type=>type!=='gift_creator');
export const diningBusinessTypes=['restaurant','cafe','bakery','caterer'] as const;
export const venueOnlyTypes=['restaurant','cafe'] as const;
export const businessTypeLabels:Record<BusinessType,string>={maker:'Independent food maker',restaurant:'Restaurant',cafe:'Café',bakery:'Bakery',caterer:'Caterer',food_brand:'Food brand',gift_creator:'Food gift creator',other:'Other food business'};
export function businessTypeLabel(value:string|null|undefined){return businessTypeLabels[value as BusinessType]||'Independent food business'}
export function isDiningBusiness(value:string|null|undefined){return diningBusinessTypes.some(type=>type===value)}
export function isVenueOnly(value:string|null|undefined){return venueOnlyTypes.some(type=>type===value)}
export function officialHttps(value:string|null|undefined,host?:string){if(!value)return undefined;try{const u=new URL(value);if(u.protocol!=='https:'||u.username||u.password)return undefined;if(host&&u.hostname!==host&&!u.hostname.endsWith('.'+host))return undefined;return u.href}catch{return undefined}}
