// Deliberately single-account, dry run by default. Never prints email, password hashes or keys.
import { PrismaClient } from '@prisma/client';
import { randomBytes } from 'node:crypto';
const prisma = new PrismaClient();
async function main() {
  const id = process.argv.find(arg => arg.startsWith('--user-id='))?.slice(10);
  const apply = process.argv.includes('--apply');
  if (!id) throw new Error('Use --user-id=<existing FreshPick user id> [--apply]');
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user || user.isBanned || !user.email || !user.isEmailVerified || user.role === 'admin' || user.secondaryRoles.includes('admin')) throw new Error('Only active, verified-email, non-admin accounts are eligible for this pilot.');
  if (user.supabaseAuthId) { console.log('Already mapped; no action.'); return; }
  if (user.passwordHash && !/^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(user.passwordHash)) throw new Error('Unsupported password hash; manual review required.');
  const duplicates = await prisma.user.count({where:{email:{equals:user.email,mode:'insensitive'}}});
  if (duplicates !== 1) throw new Error('Ambiguous application email; manual review required.');
  console.log(user.passwordHash ? 'Eligible bcrypt account.' : 'Eligible verified-email account; password recovery required.');
  if (!apply) { console.log('Dry run only; no changes made.'); return; }
  if (process.env.FRESHPICK_AUTH_MIGRATION_APPROVED !== 'true') throw new Error('Set FRESHPICK_AUTH_MIGRATION_APPROVED=true after backup and maintenance review.');
  const origin = new URL(process.env.SUPABASE_URL || '');
  if (origin.protocol !== 'https:') throw new Error('HTTPS Supabase URL required');
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error('Supabase server admin key required.');
  const headers = { apikey: key, 'Content-Type': 'application/json', ...(key.startsWith('eyJ') ? {Authorization:'Bearer '+key} : {}) };
  const endpoint = origin.origin + '/auth/v1/admin/users';
  const response = await fetch(endpoint, {method:'POST',headers,body:JSON.stringify({email:user.email.toLowerCase(),email_confirm:true,...(user.passwordHash ? {password_hash:user.passwordHash} : {password:randomBytes(32).toString('base64url')+'Aa1'}),app_metadata:{freshpick_migration_id:user.id}}),signal:AbortSignal.timeout(15000)});
  if (!response.ok) throw new Error('Supabase provisioning failed; do not attach an existing Supabase identity by email. Inspect the dashboard securely.');
  const created = await response.json();
  if (typeof created.id !== 'string' || !/^[0-9a-f-]{36}$/i.test(created.id)) throw new Error('Provider returned an unexpected identity. Reconcile manually.');
  try {
    await prisma.$transaction(async tx => {
      const result = await tx.user.updateMany({where:{id:user.id,supabaseAuthId:null,email:user.email,isEmailVerified:true,isBanned:false,passwordHash:user.passwordHash,role:user.role},data:{supabaseAuthId:created.id}});
      if (result.count !== 1) throw new Error('Account changed during migration.');
      await tx.refreshToken.deleteMany({where:{userId:user.id}});
      await tx.emailToken.deleteMany({where:{userId:user.id}});
    });
  } catch {
    // No automatic destructive cleanup: a transaction commit may have succeeded despite an ambiguous network error.
    console.error('Mapping uncertain. Inspect the database and newly created Supabase identity before retrying.');
    process.exitCode = 1; return;
  }
  console.log('Identity mapped; previous refresh and email tokens revoked. Original application user ID preserved.');
}
main().catch(error=>{console.error(error instanceof Error ? error.message : 'Migration failed');process.exitCode=1;}).finally(()=>prisma.$disconnect());
