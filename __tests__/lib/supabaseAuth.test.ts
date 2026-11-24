import prisma from '@/lib/prisma';
import { managedUser, managedSignupSchema, managedRefreshPrefix, managedPasswordLogin, startManagedSignup } from '@/lib/supabaseAuth';
jest.mock('@/lib/prisma', () => ({__esModule:true,default:{user:{findUnique:jest.fn(),findFirst:jest.fn(),create:jest.fn()}}}));
const subject='8cfd9a20-aaca-4b53-99d4-a9d75d3a5b55';
const identity={id:subject,email:'member@example.com',email_confirmed_at:'2026-11-25T00:00:00Z',user_metadata:{firstName:'Member',role:'admin'}};
const session={user:identity,access_token:'provider-access',refresh_token:'provider-refresh'};
const user={id:'existing-app-id',email:identity.email,role:'customer',secondaryRoles:[],isBanned:false};
const mockFetch=jest.fn();
const originalFetch=global.fetch;
beforeEach(()=>{jest.resetAllMocks();global.fetch=mockFetch;process.env.SUPABASE_URL='https://example.supabase.co';process.env.SUPABASE_PUBLISHABLE_KEY='public-test-key';});
afterEach(()=>{global.fetch=originalFetch;delete process.env.SUPABASE_URL;delete process.env.SUPABASE_PUBLISHABLE_KEY;});
it('preserves application identity and ignores provider metadata roles',async()=>{
  (prisma.user.findUnique as jest.Mock).mockResolvedValue(user);
  expect(await managedUser(session,false)).toEqual(user);
  expect(prisma.user.findUnique).toHaveBeenCalledWith({where:{supabaseAuthId:subject}});
});
it('never attaches an existing account just because its email matches',async()=>{
  (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
  (prisma.user.findFirst as jest.Mock).mockResolvedValue(user);
  await expect(managedUser(session,true)).rejects.toThrow('migrated');
  expect(prisma.user.create).not.toHaveBeenCalled();
});
it('rejects unverified, banned, admin and mismatched-email sessions',async()=>{
  await expect(managedUser({...session,user:{...identity,email_confirmed_at:null}},true)).rejects.toThrow('Verify');
  for(const bad of [{...user,isBanned:true},{...user,role:'admin'},{...user,secondaryRoles:['admin']},{...user,email:'different@example.com'}]){
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(bad);
    await expect(managedUser(session,false)).rejects.toThrow();
  }
});
it('only creates a customer for a verified new identity',async()=>{
  (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
  (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);
  (prisma.user.create as jest.Mock).mockResolvedValue(user);
  await managedUser(session,true);
  expect(prisma.user.create).toHaveBeenCalledWith({data:expect.objectContaining({role:'customer',supabaseAuthId:subject,isEmailVerified:true})});
});
it('normalizes email, rejects missing email and strips caller roles',()=>{
  const result=managedSignupSchema.parse({email:' MEMBER@example.com ',firstName:'Member',password:'StrongPass1',role:'admin'});
  expect(result).not.toHaveProperty('role');expect(result.email).toBe('member@example.com');
  expect(managedSignupSchema.safeParse({firstName:'Member',password:'StrongPass1'}).success).toBe(false);
});
it('uses provider password endpoint without a service role key',async()=>{
  mockFetch.mockResolvedValue({ok:true,status:200,json:async()=>session});
  expect(await managedPasswordLogin('MEMBER@example.com','StrongPass1')).toEqual(session);
  expect(mockFetch).toHaveBeenCalledWith('https://example.supabase.co/auth/v1/token?grant_type=password',expect.objectContaining({method:'POST',headers:expect.objectContaining({apikey:'public-test-key'}),body:JSON.stringify({email:identity.email,password:'StrongPass1'})}));
  expect(managedRefreshPrefix).toBe('sb:');
});
it('requires email confirmation before accepting signup',async()=>{
  (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);
  mockFetch.mockResolvedValue({ok:true,status:200,json:async()=>session});
  await expect(startManagedSignup({firstName:'Member',email:identity.email,password:'StrongPass1'})).rejects.toThrow('Email confirmation');
});
