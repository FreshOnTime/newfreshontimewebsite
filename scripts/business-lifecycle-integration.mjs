/* Only runs against the disposable CI database and localhost application. */
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { chromium } from 'playwright';

const database = new URL(process.env.DATABASE_URL || 'postgresql://invalid');
const base = new URL(process.env.VISUAL_BASE_URL || 'http://127.0.0.1:3000');
assert.equal(process.env.FRESHPICK_VISUAL_FIXTURES,'1');
assert.equal(database.hostname,'localhost');
assert.equal(database.pathname,'/freshpick_visual');
assert.equal(base.origin,'http://127.0.0.1:3000');
const db = new PrismaClient();
const password = process.env.VISUAL_PASSWORD;
assert(password,'Fixture password required');
const suffix=randomUUID().slice(0,8);
const handle='lifecycle-'+suffix;
const email=handle+'@example.invalid';
let userId, supplierId, browser;
const endpoint=path=>new URL(path,base).href;
async function call(context,method,path,data,status){
 const response=await context.request.fetch(endpoint(path),{method,headers:{Origin:base.origin},...(data===undefined?{}:{data})});
 const result=await response.json().catch(()=>null);
 assert.equal(response.status(),status,method+' '+path+': '+JSON.stringify(result));
 return result;
}
async function main(){
 const user=await db.user.create({data:{firstName:'Lifecycle fixture',email,passwordHash:await bcrypt.hash(password,10),role:'customer',isEmailVerified:true}});
 userId=user.id;
 browser=await chromium.launch({headless:true});
 const owner=await browser.newContext(),admin=await browser.newContext(),guest=await browser.newContext();
 await call(owner,'POST','/api/auth/login',{identifier:email,password},200);
 await call(admin,'POST','/api/auth/login',{identifier:'visual-admin@example.invalid',password},200);
 const registration=await call(owner,'POST','/api/suppliers/register',{companyName:'Lifecycle bakery '+suffix,contactName:'Fixture owner',email,phone:'0779876543',town:'Colombo',country:'Sri Lanka',businessType:'bakery'},201);
 supplierId=registration.supplier.id;
 assert.equal(registration.supplier.applicationStatus,'pending');
 assert.equal((await call(owner,'GET','/api/suppliers/application-status',undefined,200)).state,'pending');
 await call(owner,'GET','/api/suppliers/maker',undefined,403);
 await call(owner,'GET','/api/admin/supplier-applications',undefined,403);
 await call(guest,'GET','/api/admin/supplier-applications',undefined,401);
 const queue=await call(admin,'GET','/api/admin/supplier-applications?id='+supplierId,undefined,200);
 assert.equal(queue.applications.length,1);
 const version=queue.applications[0].reviewVersion;
 const review={id:supplierId,version,status:'approved',notes:'Isolated CI identity verification'};
 await call(admin,'PATCH','/api/admin/supplier-applications',{...review,confirmed:false},400);
 const approved=await call(admin,'PATCH','/api/admin/supplier-applications',{...review,confirmed:true},200);
 assert.equal(approved.application.applicationStatus,'approved');
 assert.equal(approved.application.status,'active');
 await call(admin,'PATCH','/api/admin/supplier-applications',{...review,confirmed:true},409);
 assert.equal((await call(owner,'GET','/api/suppliers/application-status',undefined,200)).state,'approved');
 assert(await db.notification.count({where:{targetUserId:userId,title:'Maker page approved'}})>0);
 const profile={action:'profile',handle,bio:'Isolated integration fixture',town:'Colombo',phone:'0771234567',fulfilment:'Pickup',published:false,website:'https://example.com/',publicEmail:'public@example.invalid',publicPhone:'0112345678'};
 await call(owner,'POST','/api/suppliers/maker',profile,200);
 assert.equal((await guest.request.get(endpoint('/makers/'+handle))).status(),404);
 const item={action:'item',name:'Fixture cake '+suffix,description:'Test-only cake listing',kind:'Bakery',price:3500,image:null,madeToOrder:true,published:true,contactWhatsApp:'0779876543',contactEmail:'orders@example.invalid',contactWebsite:'https://example.com/cake',purchaseUrl:'https://example.com/buy'};
 await call(owner,'POST','/api/suppliers/maker',item,200);
 const studio=await call(owner,'GET','/api/suppliers/maker',undefined,200);
 const saved=studio.items.find(i=>i.name===item.name);
 assert(saved,'New item missing from studio');
 assert.equal(saved.contactWhatsApp,'+94779876543');
 const path='/makers/'+handle+'/items/'+saved.slug;
 assert.equal((await guest.request.get(endpoint(path))).status(),404);
 await call(owner,'POST','/api/suppliers/maker',{...profile,published:true},200);
 const page=await guest.newPage();
 assert.equal((await page.goto(endpoint(path))).status(),200);
 assert(await page.getByRole('heading',{name:item.name,exact:true}).isVisible());
 const whatsapp=page.getByRole('link',{name:'Enquire on WhatsApp',exact:true});
 const wa=await whatsapp.getAttribute('href');
 assert(wa.startsWith('https://wa.me/94779876543?'));
 assert(decodeURIComponent(wa).includes(path));
 const mail=await page.getByRole('link',{name:'Send email',exact:true}).getAttribute('href');
 assert(mail.startsWith('mailto:orders@example.invalid?'));
 assert(decodeURIComponent(mail).includes(path));
 assert.equal(await page.getByRole('link',{name:'Visit website',exact:true}).getAttribute('href'),'https://example.com/cake');
 assert.equal(await page.getByRole('link',{name:'Buy on business website',exact:true}).getAttribute('href'),'https://example.com/buy');
 assert(!(await page.content()).includes(email),'Private account email must not be exposed');
 await call(owner,'POST','/api/suppliers/maker',{...item,id:saved.id,contactWhatsApp:'',contactEmail:'',contactWebsite:'',purchaseUrl:''},200);
 await page.reload();
 assert((await whatsapp.getAttribute('href')).startsWith('https://wa.me/94771234567?'));
 assert((await page.getByRole('link',{name:'Send email',exact:true}).getAttribute('href')).startsWith('mailto:public@example.invalid?'));
 assert.equal(await page.getByRole('link',{name:'Buy on business website',exact:true}).count(),0);
 const current=await db.supplier.findUniqueOrThrow({where:{id:supplierId}});
 await call(admin,'PUT','/api/admin/suppliers/'+supplierId,{status:'inactive',reviewVersion:current.reviewVersion},200);
 assert.equal((await call(owner,'GET','/api/suppliers/application-status',undefined,200)).state,'inactive');
 await call(owner,'POST','/api/suppliers/maker',item,403);
 assert.equal((await guest.request.get(endpoint(path))).status(),404);
 assert.equal((await guest.request.get(endpoint('/makers/'+handle))).status(),404);
 console.log('PASS: real database application, authorization, approval, notification, profile/product visibility, contact links, inheritance and suspension.');
}
try{await main();}
finally{
 await browser?.close();
 if(supplierId)await db.supplier.deleteMany({where:{id:supplierId}});
 if(userId)await db.user.deleteMany({where:{id:userId}});
 await db.$disconnect();
}
