const mockDb={user:{findUnique:jest.fn(),update:jest.fn()},supplier:{findUnique:jest.fn(),findFirst:jest.fn()},$queryRaw:jest.fn()};
jest.mock('@/lib/prisma',()=>({__esModule:true,default:mockDb}));
jest.mock('@/lib/auth',()=>({requireAuth:(handler:unknown)=>handler}));
import { GET } from '@/app/api/dashboard/supplier/route';
import { NextRequest } from 'next/server';
const request=()=>Object.assign(new Request('http://localhost'),{user:{userId:'supplier-user',role:'supplier'}}) as unknown as NextRequest;
beforeEach(()=>jest.clearAllMocks());
it('does not link or read a supplier based on matching contact details',async()=>{mockDb.user.findUnique.mockResolvedValue({supplier:null,email:'another-supplier@example.com'});const response=await GET(request(),undefined);expect(response.status).toBe(200);expect(await response.json()).toMatchObject({data:{linked:false}});expect(mockDb.user.update).not.toHaveBeenCalled();expect(mockDb.supplier.findUnique).not.toHaveBeenCalled();expect(mockDb.$queryRaw).not.toHaveBeenCalled();});
it('shows pending approval to the linked account without exposing catalogue statistics',async()=>{mockDb.user.findUnique.mockResolvedValue({supplier:{id:'own-supplier',applicationStatus:'pending',status:'inactive'}});const response=await GET(request(),undefined);expect(await response.json()).toMatchObject({data:{linked:true,applicationStatus:'pending'}});expect(mockDb.$queryRaw).not.toHaveBeenCalled();});
