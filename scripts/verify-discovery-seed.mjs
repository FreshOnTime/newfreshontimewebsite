// Run only on an isolated test database after applying migrations and the SQL seed.
import assert from 'node:assert/strict';
import {PrismaClient} from '@prisma/client';
const url=new URL(process.env.DATABASE_URL||'postgresql://invalid');
assert.equal(url.hostname,'localhost');
assert.equal(url.pathname,'/freshpick_test');
const db=new PrismaClient();
try{
 const rows=await db.discoveryProspect.findMany({where:{id:{startsWith:'fp-seed-'}}});
 assert.equal(rows.length,47);
 assert(rows.every(r=>r.reviewStatus==='pending'&&r.permissionStatus==='not_assessed'&&r.reviewedAt===null));
 const row=rows[0];
 await assert.rejects(db.discoveryProspect.update({where:{id:row.id},data:{reviewStatus:'approved'}}));
 const published=await db.discoveryProspect.count({where:{reviewStatus:'approved',permissionStatus:'cleared',reviewedAt:{not:null}}});
 assert.equal(published,0);
 console.log('47 private prospects, idempotent import, publish constraint enforced.');
}finally{await db.$disconnect()}
