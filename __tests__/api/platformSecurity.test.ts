import { NextRequest } from 'next/server';
import { sign } from 'jsonwebtoken';
const mockDb={user:{findUnique:jest.fn(),findFirst:jest.fn(),update:jest.fn()},auditLog:{create:jest.fn()},supplier:{findUnique:jest.fn(),updateMany:jest.fn()}};
jest.mock('next/server',()=>jest.requireActual('next/server'));
jest.mock('@/lib/prisma',()=>({__esModule:true,default:mockDb}));
jest.mock('@/lib/productImageUpload',()=>({readProductImage:jest.fn(),storeProductImage:jest.fn(),ImageUploadError:class extends Error{status=400}}));
import { readProductImage } from '@/lib/productImageUpload';
import { PUT as editSupplier } from '@/app/api/admin/suppliers/[id]/route';
import { POST as promote } from '@/app/api/admin/make-admin/route';
import { POST as upload } from '@/app/api/upload/images/products/route';
const actor={id:'actor',firstName:'Admin',role:'admin',secondaryRoles:[],isBanned:false};
function request(type='access',role='admin',authenticated=true){const token=sign({userId:actor.id,role,type},process.env.JWT_SECRET!);return new NextRequest('http://localhost/api/admin/make-admin',{method:'POST',headers:authenticated?{cookie:`accessToken=${token}`}:{},body:JSON.stringify({userId:'target'})});}
beforeEach(()=>{jest.clearAllMocks();mockDb.user.findUnique.mockResolvedValue(actor);mockDb.user.findFirst.mockResolvedValue({id:'target',role:'customer',isBanned:false});mockDb.user.update.mockResolvedValue({id:'target',role:'admin'});});
it('blocks unauthenticated promotion and image body parsing',async()=>{expect((await promote(request('access','admin',false))).status).toBe(401);expect((await upload(request('access','admin',false))).status).toBe(401);expect(mockDb.user.update).not.toHaveBeenCalled();expect(readProductImage).not.toHaveBeenCalled();});
it.each([{...actor,role:'customer'},{...actor,isBanned:true}])('uses the current database role/banned state rather than JWT admin claims',async user=>{mockDb.user.findUnique.mockResolvedValue(user);expect((await promote(request())).status).toBe(403);expect(mockDb.user.update).not.toHaveBeenCalled();});
it('rejects refresh tokens on admin and upload APIs',async()=>{expect((await promote(request('refresh')))).toHaveProperty('status',401);expect((await upload(request('refresh')))).toHaveProperty('status',401);});
it('allows a verified secondary admin and attributes the audit record',async()=>{mockDb.user.findUnique.mockResolvedValue({...actor,role:'customer',secondaryRoles:['admin']});expect((await promote(request('access','customer'))).status).toBe(200);expect(mockDb.auditLog.create).toHaveBeenCalledWith({data:expect.objectContaining({userId:actor.id,action:'promote',resourceId:'target'})});});
it('blocks pending supplier uploads before reading their image',async()=>{mockDb.user.findUnique.mockResolvedValue({...actor,role:'supplier',supplier:{applicationStatus:'pending',status:'inactive'}});expect((await upload(request('access','supplier'))).status).toBe(403);expect(readProductImage).not.toHaveBeenCalled();});

const supplierRequest=()=>new NextRequest('http://localhost/api/admin/suppliers/vendor',{method:'PUT',headers:{cookie:`accessToken=${sign({userId:actor.id,role:'admin',type:'access'},process.env.JWT_SECRET!)}`},body:JSON.stringify({status:'active'})});
it('cannot activate pending suppliers through the older edit endpoint',async()=>{mockDb.supplier.findUnique.mockResolvedValue({id:'vendor',applicationStatus:'pending',reviewVersion:0});expect((await editSupplier(supplierRequest(),{params:Promise.resolve({id:'vendor'})})).status).toBe(409);expect(mockDb.supplier.updateMany).not.toHaveBeenCalled();});
it('rejects a supplier edit when review changed after its initial read',async()=>{mockDb.supplier.findUnique.mockResolvedValue({id:'vendor',applicationStatus:'approved',reviewVersion:4});mockDb.supplier.updateMany.mockResolvedValue({count:0});expect((await editSupplier(supplierRequest(),{params:Promise.resolve({id:'vendor'})})).status).toBe(409);expect(mockDb.supplier.updateMany).toHaveBeenCalledWith(expect.objectContaining({where:{id:'vendor',reviewVersion:4}}));});
