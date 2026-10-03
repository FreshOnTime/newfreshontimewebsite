import { NextRequest } from 'next/server';
import { sign } from 'jsonwebtoken';
import { PATCH } from '@/app/api/notifications/route';
import prisma from '@/lib/prisma';
jest.mock('next/server',()=>jest.requireActual('next/server'));
jest.mock('@/lib/prisma',()=>({__esModule:true,default:{user:{findUnique:jest.fn()},notification:{findMany:jest.fn()},notificationRead:{createMany:jest.fn()}}}));
const db=prisma as unknown as Record<string, Record<string, jest.Mock>>;
function request(body:unknown,type='access'){return new NextRequest('http://localhost/api/notifications',{method:'PATCH',headers:{cookie:'accessToken='+sign({userId:'customer',role:'customer',type},process.env.JWT_SECRET!)},body:JSON.stringify(body)});}
beforeEach(()=>{jest.clearAllMocks();db.user.findUnique.mockResolvedValue({id:'customer',role:'customer',isBanned:false});db.notification.findMany.mockResolvedValue([{id:'broadcast'}]);db.notificationRead.createMany.mockResolvedValue({count:1});});
it('persists recipient-specific reads and safely deduplicates repeated IDs',async()=>{
  expect((await PATCH(request({ids:['broadcast','broadcast']}))).status).toBe(200);
  expect(db.notificationRead.createMany).toHaveBeenCalledWith({data:[{notificationId:'broadcast',userId:'customer'}],skipDuplicates:true});
});
it('rejects the entire batch if any notification belongs to another recipient',async()=>{
  expect((await PATCH(request({ids:['broadcast','private-other']}))).status).toBe(404);expect(db.notificationRead.createMany).not.toHaveBeenCalled();
});
it.each([{ids:[]},{ids:Array(51).fill('broadcast')},{ids:[123]}])('rejects invalid read batches',async ({ids})=>{
  expect((await PATCH(request({ids}))).status).toBe(400);expect(db.notificationRead.createMany).not.toHaveBeenCalled();
});
it('reports write failures without claiming the notification was read',async()=>{
  db.notificationRead.createMany.mockRejectedValueOnce(new Error('offline'));expect((await PATCH(request({ids:['broadcast']}))).status).toBe(500);
});
it('rejects refresh-token read mutations',async()=>{expect((await PATCH(request({ids:['broadcast']},'refresh'))).status).toBe(401);expect(db.notificationRead.createMany).not.toHaveBeenCalled();});
