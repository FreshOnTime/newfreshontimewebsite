import { NextRequest } from 'next/server';
import { sign } from 'jsonwebtoken';
import { GET, POST } from '@/app/api/admin/notifications/route';
import prisma from '@/lib/prisma';
jest.mock('next/server', () => jest.requireActual('next/server'));
jest.mock('@/lib/prisma', () => ({ __esModule: true, default: {
  user: { findUnique: jest.fn() }, notification: { findMany: jest.fn(), count: jest.fn(), create: jest.fn(), createMany: jest.fn(), findUnique: jest.fn() }, notificationRead: { createMany: jest.fn() }, auditLog: { create: jest.fn() }, $transaction: jest.fn(),
} }));
const db = prisma as unknown as Record<string, Record<string, jest.Mock>> & { $transaction: jest.Mock };
const user = { id: 'customer', role: 'customer', firstName: 'Market', isBanned: false, secondaryRoles: [] };
function request(method='GET',body?: unknown,tokenType='access',role='customer',path='/api/admin/notifications') {
  const token=sign({ userId: user.id, type: tokenType, role },process.env.JWT_SECRET!);
  return new NextRequest('http://localhost'+path,{ method, headers:{cookie:'accessToken='+token},...(body===undefined?{}:{body:JSON.stringify(body)}) });
}
beforeEach(()=>{
  jest.clearAllMocks();db.user.findUnique.mockResolvedValue(user);db.notification.findMany.mockResolvedValue([]);db.notification.count.mockResolvedValue(0);db.$transaction.mockImplementation(async(fn: (tx: unknown) => Promise<unknown>)=>fn(db));
});
it('makes recipient notification reads private and includes independent read receipts',async()=>{
  const response=await GET(request());expect(response.status).toBe(200);expect(response.headers.get('Cache-Control')).toBe('private, no-store');
  expect(db.notification.findMany.mock.calls[0][0].include.readReceipts.where.userId).toBe(user.id);
});
it('rejects unsafe notification links and malformed payloads before persistence',async()=>{
  db.user.findUnique.mockResolvedValue({...user,role:'admin'});
  const response=await POST(request('POST',{title:'Update',message:'Ready',link:'javascript:alert(1)'}));expect(response.status).toBe(400);expect(db.notification.create).not.toHaveBeenCalled();
});
it('rejects a stale admin role with a permission status',async()=>{
  const response=await POST(request('POST',{title:'Update',message:'Ready'},'access','admin'));expect(response.status).toBe(403);
});
it.each(['javascript:alert(1)', '//evil.example', '/\\evil.example', '/%2Fevil.example', '/%5cevil.example', '/%0aevil', 'https://evil.example', '/bad%ZZ'])('rejects an unsafe link %s',async link=>{
  db.user.findUnique.mockResolvedValue({...user,role:'admin'});
  expect((await POST(request('POST',{title:'Update',message:'Ready',link}))).status).toBe(400);
  expect(db.notification.createMany).not.toHaveBeenCalled();
});
it.each([{title:' ',message:'Hi'},{title:'Hi',message:' '},{title:'Hi',message:'Hi',type:'bogus'},{title:'Hi',message:'Hi',submissionId:'invalid'}])('validates notification input',async body=>{
  db.user.findUnique.mockResolvedValue({...user,role:'admin'});expect((await POST(request('POST',body))).status).toBe(400);
});
it('rejects invalid pagination and refresh-token access',async()=>{
  expect((await GET(request('GET',undefined,'access','customer','/api/notifications?page=-1'))).status).toBe(400);
  expect((await GET(request('GET',undefined,'refresh'))).status).toBe(401);
  expect(db.notification.findMany).not.toHaveBeenCalled();
});
it('does not deliver another customer target ID or unsafe legacy links',async()=>{
  db.notification.findMany.mockResolvedValue([{id:'n1',targetUserId:user.id,link:'javascript:alert(1)',readReceipts:[{readAt:new Date()}]}]);
  const data=await (await GET(request())).json();expect(data.data[0].isRead).toBe(true);expect(data.data[0].link).toBeNull();expect(data.data[0].targetUserId).toBeUndefined();
});
it('deduplicates notification retries, audits once and rejects changed intent',async()=>{
  db.user.findUnique.mockResolvedValue({...user,role:'admin'});
  const rows=new Map<string,Record<string,unknown>>();
  db.notification.createMany.mockImplementation(async ({data}:{data:Record<string,unknown>[]})=>{let count=0;for(const row of data){const id=row.id as string;if(!rows.has(id)){rows.set(id,row);count++;}}return {count};});
  db.notification.findUnique.mockImplementation(async ({where}:{where:{id:string}})=>rows.get(where.id));
  const body={title:'Update',message:'Ready',submissionId:'3cc31836-ae23-4a49-8022-c270ec057b58'};
  expect((await POST(request('POST',body))).status).toBe(201);
  expect((await POST(request('POST',body))).status).toBe(200);
  expect(rows.size).toBe(1);expect(db.auditLog.create).toHaveBeenCalledTimes(1);
  expect((await POST(request('POST',{...body,message:'Changed'}))).status).toBe(409);
});
it('accepts a secondary admin but refuses a banned target account',async()=>{
  db.user.findUnique.mockResolvedValueOnce({...user,secondaryRoles:['admin']}).mockResolvedValueOnce({id:'banned',isBanned:true});
  expect((await POST(request('POST',{title:'Update',message:'Ready',targetUserId:'banned'}))).status).toBe(404);
  expect(db.notification.createMany).not.toHaveBeenCalled();
});
