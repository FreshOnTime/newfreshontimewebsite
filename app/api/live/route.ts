import {listLiveVendors} from '@/lib/liveVendorService';
export const dynamic='force-dynamic';
export async function GET(){try{return Response.json({vendors:await listLiveVendors()},{headers:{'Cache-Control':'no-store'}});}catch(error){console.error('Live discovery unavailable',error);return Response.json({error:'Live locations are temporarily unavailable.'},{status:503,headers:{'Cache-Control':'no-store'}});}}
