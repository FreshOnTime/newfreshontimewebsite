import {requireAuth} from '@/lib/auth';
import {validateOrigin} from '@/lib/middleware/adminAuth';
import prisma from '@/lib/prisma';
import {clearedStop,liveAction,pairedCoordinates} from '@/lib/liveVendor';
import {eligibleLiveSupplier} from '@/lib/liveVendorService';
const reply=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'private, no-store'}});
async function supplierFor(userId:string,role:string){if(role!=='supplier')return null;return (await prisma.user.findUnique({where:{id:userId},select:{supplier:{select:{id:true,status:true,applicationStatus:true,makerPublished:true,makerHandle:true,makerWhatsApp:true}}}}))?.supplier||null;}
export const GET=requireAuth(async request=>{
 const supplier=await supplierFor(request.user!.userId,request.user!.role);if(!supplier)return reply({error:'Business account required'},403);
 const record=await prisma.liveVendor.findUnique({where:{supplierId:supplier.id}});
 return reply({record,eligible:supplier.status==='active'&&supplier.applicationStatus==='approved'&&supplier.makerPublished&&!!supplier.makerHandle&&!!supplier.makerWhatsApp});
});
export const POST=requireAuth(async request=>{
 if(!validateOrigin(request))return reply({error:'Invalid request origin'},403);
 const user=request.user!,supplier=await supplierFor(user.userId,user.role);if(!supplier)return reply({error:'Business account required'},403);
 const parsed=liveAction.safeParse(await request.json().catch(()=>null));if(!parsed.success)return reply({error:parsed.error.issues[0].message},400);const v=parsed.data;
 const owner={products:{some:{id:user.userId,role:'supplier' as const,isBanned:false}}};
 if(v.action==='stop'){await prisma.liveVendor.updateMany({where:{supplierId:supplier.id,supplier:owner},data:clearedStop});return reply({ok:true});}
 if(supplier.status!=='active'||supplier.applicationStatus!=='approved'||!supplier.makerPublished||!supplier.makerHandle||!supplier.makerWhatsApp)return reply({error:'Publish an approved business profile before using FreshPick Live.'},403);
 if(v.action==='apply'){
  const record=await prisma.liveVendor.findUnique({where:{supplierId:supplier.id}});
  if(record)return reply({error:'An application already exists. Contact FreshPick for changes.'},409);
  try{await prisma.liveVendor.create({data:{supplierId:supplier.id,kind:v.kind}});return reply({ok:true},201);}catch(error){console.error('Live application failed',error);return reply({error:'Unable to submit application. Refresh and try again.'},409);}
 }
 if(!pairedCoordinates(v.latitude,v.longitude))return reply({error:'Provide both coordinates or neither.'},400);
 const now=new Date();const servingUntil=new Date(now.getTime()+v.hours*3600000);
 const result=await prisma.liveVendor.updateMany({where:{supplierId:supplier.id,approval:'approved',supplier:{...eligibleLiveSupplier,...owner},OR:[{checkedInAt:null},{checkedInAt:{lte:new Date(now.getTime()-15000)}}]},data:{location:v.location,area:v.area,note:v.note,latitude:v.latitude===null?null:Math.round(v.latitude*10000)/10000,longitude:v.longitude===null?null:Math.round(v.longitude*10000)/10000,checkedInAt:now,servingUntil}});
 if(!result.count)return reply({error:'Live approval is required, or a stop was updated recently. Refresh and try again.'},409);
 return reply({ok:true});
});
