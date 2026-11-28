import type { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { POST } from '@/app/api/suppliers/maker/route';

jest.mock('@/lib/auth', () => ({requireAuth: (handler: unknown) => handler}));
jest.mock('@/lib/prisma', () => ({__esModule:true,default:{
  user:{findUnique:jest.fn()},
  supplier:{updateMany:jest.fn()},
  makerItem:{create:jest.fn(),updateMany:jest.fn()},
}}));
const db=prisma as unknown as {user:{findUnique:jest.Mock};supplier:{updateMany:jest.Mock};makerItem:{create:jest.Mock;updateMany:jest.Mock}};
const profile={action:'profile',handle:'demo-business',bio:'',town:'Colombo',phone:'0771234567',fulfilment:'Pickup',published:true};
const item={action:'item',name:'Chocolate cake',description:'Fresh cake',kind:'Bakery',price:3500,image:null,madeToOrder:true,published:true};
function req(body:unknown){
 return Object.assign(new Request('http://localhost/api/suppliers/maker',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}),{user:{userId:'user-1',role:'supplier'}}) as unknown as NextRequest;
}
beforeEach(()=>{
 jest.clearAllMocks();
 db.user.findUnique.mockResolvedValue({supplier:{id:'business-1',status:'active',applicationStatus:'approved',makerHandle:'demo-business'}});
 db.supplier.updateMany.mockResolvedValue({count:1});
 db.makerItem.updateMany.mockResolvedValue({count:1});
 db.makerItem.create.mockResolvedValue({id:'item-1'});
});
it('stores explicitly public profile details separately from account details',async()=>{
 const response=await POST(req({...profile,publicEmail:'sales@example.com',publicPhone:'0112345678',facebook:'https://www.facebook.com/demo',tiktok:'https://www.tiktok.com/@demo'}),{});
 expect(response.status).toBe(200);
 expect(db.supplier.updateMany).toHaveBeenCalledWith(expect.objectContaining({data:expect.objectContaining({businessPublicEmail:'sales@example.com',businessPublicPhone:'+94112345678',businessFacebook:'https://www.facebook.com/demo',businessTikTok:'https://www.tiktok.com/@demo'})}));
 expect(db.supplier.updateMany.mock.calls[0][0].data).not.toHaveProperty('email');
});
it('stores normalized item overrides and an external purchase link',async()=>{
 const response=await POST(req({...item,contactWhatsApp:'0779876543',contactEmail:'cake@example.com',contactPhone:'0112345678',contactWebsite:'https://example.com/cake',purchaseUrl:'https://example.com/buy'}),{});
 expect(response.status).toBe(200);
 expect(db.makerItem.create).toHaveBeenCalledWith({data:expect.objectContaining({supplierId:'business-1',contactWhatsApp:'+94779876543',contactEmail:'cake@example.com',contactPhone:'+94112345678',contactWebsite:'https://example.com/cake',purchaseUrl:'https://example.com/buy'})});
});
it('clears item overrides for inheritance and restricts edits to the owning business',async()=>{
 const response=await POST(req({...item,id:'item-1',contactWhatsApp:'',contactEmail:'',contactPhone:'',contactWebsite:'',purchaseUrl:''}),{});
 expect(response.status).toBe(200);
 expect(db.makerItem.updateMany).toHaveBeenCalledWith({where:{id:'item-1',supplierId:'business-1'},data:expect.objectContaining({contactWhatsApp:null,contactEmail:null,contactPhone:null,contactWebsite:null,purchaseUrl:null})});
});
it('rejects unsafe links before writing',async()=>{
 const response=await POST(req({...item,purchaseUrl:'javascript:alert(1)'}),{});
 expect(response.status).toBe(400);
 expect(db.makerItem.create).not.toHaveBeenCalled();
});
it('rejects publishing changes from a pending supplier',async()=>{
 db.user.findUnique.mockResolvedValue({supplier:{id:'business-1',status:'inactive',applicationStatus:'pending',makerHandle:'demo-business'}});
 const response=await POST(req({...item,contactEmail:'sales@example.com'}),{});
 expect(response.status).toBe(403);
 expect(db.makerItem.create).not.toHaveBeenCalled();
});
