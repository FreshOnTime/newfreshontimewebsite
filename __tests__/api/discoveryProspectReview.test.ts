import {NextRequest} from 'next/server';
import prisma from '@/lib/prisma';
import {GET,PATCH} from '@/app/api/admin/discovery-prospects/route';

jest.mock('@/lib/middleware/adminAuth',()=>({requireAdminSimple:(handler:unknown)=>handler,validateOrigin:()=>true}));
jest.mock('@/lib/prisma',()=>({__esModule:true,default:{
 $transaction:jest.fn(),discoveryProspect:{findMany:jest.fn(),count:jest.fn(),findUnique:jest.fn(),updateMany:jest.fn(),findUniqueOrThrow:jest.fn()}
}}));
const db=prisma as unknown as {$transaction:jest.Mock;discoveryProspect:{findMany:jest.Mock;count:jest.Mock;findUnique:jest.Mock;updateMany:jest.Mock;findUniqueOrThrow:jest.Mock}};
const version='2026-11-28T12:00:00.000Z';
const body={id:'listing-1',version,decision:'approved',notes:'Existing verified review evidence',confirmed:true};
function request(payload=body){return new NextRequest('http://localhost/api/admin/discovery-prospects',{method:'PATCH',body:JSON.stringify(payload)});}
beforeEach(()=>{jest.resetAllMocks();db.$transaction.mockImplementation((v:Promise<unknown>[])=>Promise.all(v));db.discoveryProspect.findMany.mockResolvedValue([]);db.discoveryProspect.count.mockResolvedValue(521);db.discoveryProspect.findUnique.mockResolvedValue({id:'listing-1'});db.discoveryProspect.updateMany.mockResolvedValue({count:1});db.discoveryProspect.findUniqueOrThrow.mockResolvedValue({id:'listing-1',reviewStatus:'approved',reviewNotes:body.notes});});
it('pages filtered records beyond the old 500 record cap',async()=>{
 const response=await GET(new NextRequest('http://localhost/api/admin/discovery-prospects?page=26&status=pending'));
 expect(response.status).toBe(200);expect(await response.json()).toMatchObject({page:26,pages:27,total:521});
 expect(db.discoveryProspect.findMany).toHaveBeenCalledWith(expect.objectContaining({skip:500,take:20,where:{reviewStatus:'pending'}}));
});
it('persists existing evidence and only approves after explicit confirmation',async()=>{
 const response=await PATCH(request());expect(response.status).toBe(200);
 expect(db.discoveryProspect.updateMany).toHaveBeenCalledWith({where:{id:'listing-1',updatedAt:new Date(version)},data:expect.objectContaining({reviewStatus:'approved',permissionStatus:'cleared',reviewNotes:body.notes})});
});
it('rejects stale reviews rather than overwriting a more recent decision',async()=>{
 db.discoveryProspect.updateMany.mockResolvedValue({count:0});expect((await PATCH(request())).status).toBe(409);expect(db.discoveryProspect.findUniqueOrThrow).not.toHaveBeenCalled();
});
it('rejects missing evidence or confirmation',async()=>{
 expect((await PATCH(request({...body,notes:' '}))).status).toBe(400);
 expect((await PATCH(request({...body,confirmed:false}))).status).toBe(400);
 expect(db.discoveryProspect.updateMany).not.toHaveBeenCalled();
});
