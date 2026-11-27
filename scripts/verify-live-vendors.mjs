import {PrismaClient} from '@prisma/client';
import assert from 'node:assert/strict';
const url=new URL(process.env.DATABASE_URL||'postgresql://invalid');
assert.equal(url.hostname,'localhost');assert.equal(url.pathname,'/freshpick_test');
const db=new PrismaClient();
const now=new Date(),until=new Date(now.getTime()+3600000);
const stop={location:'Test public stop',area:'Test area',latitude:6.9,longitude:79.9,note:'Test only',checkedInAt:now,servingUntil:until};
const cleared={location:'',area:'',latitude:null,longitude:null,note:'',checkedInAt:null,servingUntil:null};
let supplier;
try{
 supplier=await db.supplier.create({data:{name:'Live DB fixture',contactName:'Fixture',phone:'+12025550101',status:'active',applicationStatus:'approved',makerPublished:true,makerHandle:'live-db-fixture',makerWhatsApp:'+12025550101'}});
 const where={supplierId:supplier.id};
 await db.liveVendor.create({data:{...where,kind:'truck'}});
 await assert.rejects(db.liveVendor.update({where,data:stop}));
 await db.liveVendor.update({where,data:{approval:'approved',reviewedAt:now,reviewedBy:'test-admin'}});
 await assert.rejects(db.liveVendor.update({where,data:{...stop,latitude:null}}));
 await assert.rejects(db.liveVendor.update({where,data:{...stop,servingUntil:new Date(now.getTime()+13*3600000)}}));
 await db.liveVendor.update({where,data:stop});
 assert.equal(await db.liveVendor.count({where:{...where,approval:'approved',servingUntil:{gt:now}}}),1);
 assert.equal(await db.liveVendor.count({where:{...where,approval:'approved',servingUntil:{gt:until}}}),0);
 await assert.rejects(db.liveVendor.update({where,data:{approval:'suspended'}}));
 await db.liveVendor.update({where,data:{...cleared,approval:'suspended'}});
 assert.equal(await db.liveVendor.count({where:{...where,approval:'approved',servingUntil:{gt:now}}}),0);
 assert.equal((await db.liveVendor.findUniqueOrThrow({where})).latitude,null);
 console.log('Live vendor approval, coordinate, expiry and suspension constraints verified.');
}finally{if(supplier)await db.supplier.delete({where:{id:supplier.id}});await db.$disconnect();}
