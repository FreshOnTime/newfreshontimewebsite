import {NextRequest} from 'next/server';
import {sign} from 'jsonwebtoken';
import {GET} from '@/app/api/admin/activities/route';
import prisma from '@/lib/prisma';
jest.mock('@/lib/prisma',()=>({__esModule:true,default:{user:{findUnique:jest.fn()},auditLog:{findMany:jest.fn(),count:jest.fn()}}}));
const admin={id:'admin',role:'admin',secondaryRoles:[],isBanned:false,firstName:'Admin'};
function req(q=''){const token=sign({userId:'admin',type:'access',role:'admin'},process.env.JWT_SECRET!,{expiresIn:60});return new NextRequest('http://localhost/api/admin/activities'+q,{headers:{cookie:'accessToken='+token}});}
beforeEach(()=>{jest.resetAllMocks();(prisma.user.findUnique as jest.Mock).mockResolvedValue(admin);(prisma.auditLog.findMany as jest.Mock).mockResolvedValue([]);(prisma.auditLog.count as jest.Mock).mockResolvedValue(0);});
it.each(['?page=abc','?limit=0','?limit=101','?page=1.5'])('rejects invalid audit pagination %s',async q=>{expect((await GET(req(q))).status).toBe(400);expect(prisma.auditLog.findMany).not.toHaveBeenCalled();});
it('returns only safe summaries for notifications and other newer resource types',async()=>{
 (prisma.auditLog.findMany as jest.Mock).mockResolvedValue([{id:'a',userId:'admin',action:'send_notification',resourceType:'notification',resourceId:'n',timestamp:new Date('2026-11-27T00:00:00Z'),ip:null,userAgent:null,user:null,before:{secret:'private'},after:{secret:'private'}}]);
 (prisma.auditLog.count as jest.Mock).mockResolvedValue(1);
 const res=await GET(req('?resourceType=notification'));expect(res.status).toBe(200);expect(res.headers.get('Cache-Control')).toBe('private, no-store');const data=await res.json();expect(data.activities[0].log.resourceType).toBe('notification');expect(JSON.stringify(data)).not.toContain('private');
 expect(prisma.auditLog.findMany).toHaveBeenCalledWith(expect.objectContaining({where:{resourceType:'notification'},orderBy:[{timestamp:'desc'},{id:'desc'}],select:expect.not.objectContaining({before:true,after:true})}));
});
it('retains a valid page count for an empty audit trail',async()=>{const r=await GET(req());expect((await r.json()).pagination.pages).toBe(1);});
it('refuses a non-admin before reading logs',async()=>{(prisma.user.findUnique as jest.Mock).mockResolvedValue({...admin,role:'customer'});expect((await GET(req())).status).toBe(403);expect(prisma.auditLog.findMany).not.toHaveBeenCalled();});
