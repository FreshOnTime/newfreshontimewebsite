import { PrismaClient } from '@prisma/client';

// Reuse a single PrismaClient across hot-reloads / serverless invocations to
// avoid exhausting Postgres connections. Mirrors the cached-connection pattern
// used by the legacy Mongoose helper in lib/database.ts.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
