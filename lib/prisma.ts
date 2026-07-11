import { PrismaClient } from '@prisma/client';

// Reuse a single PrismaClient for the lifetime of a serverless worker. Netlify
// can keep a worker warm across requests; recreating the client each time adds
// a new Supabase connection handshake to otherwise fast API calls.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

globalForPrisma.prisma = prisma;

export default prisma;
