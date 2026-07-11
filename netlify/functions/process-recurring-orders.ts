import type { Config } from '@netlify/functions';
import { RecurringOrderService } from '../../lib/services/recurringOrderService';
import { SubscriptionDeliveryService } from '../../lib/services/subscriptionDeliveryService';

export default async () => {
  const [recurringOrders, subscriptions] = await Promise.all([
    RecurringOrderService.processRecurringOrders(),
    SubscriptionDeliveryService.processDueSubscriptions(),
  ]);
  return Response.json({ recurringOrders, subscriptions });
};

// Scheduled functions run in UTC. Every 15 minutes keeps deliveries timely
// without letting a large backfill exceed Netlify's scheduled-function limit.
export const config: Config = {
  schedule: '*/15 * * * *',
};
