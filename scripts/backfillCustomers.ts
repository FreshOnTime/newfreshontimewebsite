import { config } from 'dotenv';
config();
import prisma from '@/lib/prisma';

async function run() {
  const customers = await prisma.user.count({ where: { role: 'customer' } });
  const registrationAddresses = await prisma.address.count({ where: { isRegistration: true } });

  console.log(
    JSON.stringify(
      {
        customers,
        registrationAddresses,
        message: 'Customer backfill is no longer needed: customer profiles now live in User rows with registration addresses.',
      },
      null,
      2
    )
  );
}

run().catch((e) => {
  console.error('Backfill failed:', e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
