import { PrismaClient } from '@prisma/client';

function getRuntimeDatabaseUrl() {
  const rawUrl = process.env.DATABASE_URL;
  if (!rawUrl) return undefined;

  try {
    const url = new URL(rawUrl);
    const isPostgres = url.protocol === 'postgresql:' || url.protocol === 'postgres:';
    const isSupabaseSharedPooler = url.hostname.endsWith('.pooler.supabase.com');

    if (!isPostgres || !isSupabaseSharedPooler) {
      return rawUrl;
    }

    // Supabase shared pooler:
    //   5432 = session mode (one DB connection is pinned per client)
    //   6543 = transaction mode (connections are shared between serverless clients)
    // Vercel/Netlify scale horizontally, so session mode can exhaust a small
    // Supabase pool very quickly even when each worker reuses one PrismaClient.
    if (url.port === '5432') {
      url.port = '6543';
    }

    if (url.port === '6543') {
      // Transaction mode requires Prisma to avoid prepared statements.
      url.searchParams.set('pgbouncer', 'true');

      // Keep each serverless worker to one connection by default. This can be
      // raised deliberately later if profiling shows a need for more parallel DB work.
      url.searchParams.set(
        'connection_limit',
        process.env.PRISMA_CONNECTION_LIMIT?.trim() || '1',
      );
    }

    return url.toString();
  } catch {
    // Preserve Prisma's normal validation/error reporting for malformed URLs.
    return rawUrl;
  }
}

// Reuse a single PrismaClient for the lifetime of a serverless worker.
// The datasource override converts a Supabase shared session-pool URL into the
// transaction-pool URL at runtime, while Prisma CLI/migrations can continue to
// use DATABASE_URL unchanged.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: getRuntimeDatabaseUrl(),
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

globalForPrisma.prisma = prisma;

export default prisma;
