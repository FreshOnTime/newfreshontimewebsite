import prisma from '@/lib/prisma';
import {publicMakerWhere} from '@/lib/makers';
import {liveKinds,type LiveKind,type PublicLiveVendor} from '@/lib/liveVendor';
export const eligibleLiveSupplier={...publicMakerWhere,products:{some:{role:'supplier',isBanned:false}}} as const;
export async function listLiveVendors(now=new Date()):Promise<PublicLiveVendor[]>{
 const rows=await prisma.liveVendor.findMany({where:{approval:'approved',servingUntil:{gt:now},checkedInAt:{lte:now},supplier:eligibleLiveSupplier},select:{kind:true,location:true,area:true,latitude:true,longitude:true,note:true,servingUntil:true,checkedInAt:true,supplier:{select:{name:true,makerHandle:true}}},orderBy:[{checkedInAt:'desc'},{supplierId:'asc'}],take:100});
 return rows.flatMap(r=>r.servingUntil&&r.checkedInAt&&r.supplier.makerHandle&&liveKinds.includes(r.kind as LiveKind)?[{kind:r.kind as LiveKind,name:r.supplier.name,handle:r.supplier.makerHandle,location:r.location,area:r.area,latitude:r.latitude,longitude:r.longitude,note:r.note,servingUntil:r.servingUntil.toISOString(),checkedInAt:r.checkedInAt.toISOString()}]:[]);
}
