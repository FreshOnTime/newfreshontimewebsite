import {z} from 'zod';
export const liveKinds=['truck','coffee_cart','ice_cream','popup','street_food','market_stall'] as const;
export type LiveKind=typeof liveKinds[number];
export const liveLabels:Record<LiveKind,string>={truck:'Food truck',coffee_cart:'Mobile coffee cart',ice_cream:'Ice cream van',popup:'Pop-up kitchen',street_food:'Street food vendor',market_stall:'Market stall'};
export const MAX_SESSION_HOURS=12;
export const clearedStop={location:'',area:'',latitude:null,longitude:null,note:'',servingUntil:null,checkedInAt:null} as const;
export const liveAction=z.discriminatedUnion('action',[
 z.object({action:z.literal('apply'),kind:z.enum(liveKinds)}).strict(),
 z.object({action:z.literal('start'),location:z.string().trim().min(3).max(160),area:z.string().trim().min(2).max(100),note:z.string().trim().max(300),latitude:z.number().finite().min(5.8).max(10).nullable(),longitude:z.number().finite().min(79.4).max(82.1).nullable(),hours:z.number().int().min(1).max(MAX_SESSION_HOURS),consent:z.literal(true)}).strict(),
 z.object({action:z.literal('stop')}).strict()
]);
export function pairedCoordinates(lat:number|null,lng:number|null){return (lat===null)===(lng===null);}
export function isServing(until:string|Date|null,now=Date.now()){return until!==null&&new Date(until).getTime()>now;}
export const liveDate=(date:string|Date)=>new Intl.DateTimeFormat('en-LK',{timeZone:'Asia/Colombo',dateStyle:'medium',timeStyle:'short'}).format(new Date(date));
export function mapLink(v:{latitude:number|null;longitude:number|null;location:string;area:string}){
 const query=v.latitude!==null&&v.longitude!==null?v.latitude+','+v.longitude:[v.location,v.area,'Sri Lanka'].join(', ');
 return 'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(query);
}
export type PublicLiveVendor={kind:LiveKind;name:string;handle:string;location:string;area:string;latitude:number|null;longitude:number|null;note:string;servingUntil:string;checkedInAt:string};
