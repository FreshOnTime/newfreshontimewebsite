/**
 * Container/cron entry point for FreshPick's existing scheduled operations.
 * Run one job per invocation; OpenChoreo's CronJob supplies the schedule.
 * Do not expose this as an unauthenticated HTTP endpoint.
 */
import prisma from '@/lib/prisma';
import { RecurringOrderService } from '@/lib/services/recurringOrderService';
import { SubscriptionDeliveryService } from '@/lib/services/subscriptionDeliveryService';
import { processEmailOutbox } from '@/lib/services/emailOutboxService';

type JobName = 'recurring' | 'outbox';

async function main() {
  const job = process.argv[2] as JobName | undefined;
  if (job !== 'recurring' && job !== 'outbox') {
    throw new Error('Expected a scheduled job name: recurring or outbox');
  }
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required for scheduled jobs');
  }

  if (job === 'outbox') {
    const result = await processEmailOutbox();
    console.info(JSON.stringify({ job, result }));
    return;
  }

  // Wait for *both* jobs to finish before closing Prisma, even if one fails.
  const [orders, subscriptions] = await Promise.allSettled([
    RecurringOrderService.processRecurringOrders(),
    SubscriptionDeliveryService.processDueSubscriptions(),
  ]);
  console.info(JSON.stringify({
    job,
    recurringOrders: orders.status === 'fulfilled' ? orders.value : { failed: true },
    subscriptions: subscriptions.status === 'fulfilled' ? subscriptions.value : { failed: true },
  }));
  if (orders.status === 'rejected' || subscriptions.status === 'rejected') {
    throw new Error('One or more recurring delivery tasks failed; inspect protected logs');
  }
}

main()
  .catch((error: unknown) => {
    // Never dump connection strings or serialized provider credentials to logs.
    console.error('FreshPick scheduled job failed', error instanceof Error ? error.name : 'UnknownError');
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
