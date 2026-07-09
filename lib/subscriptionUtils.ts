import { Prisma } from '@prisma/client';

const DAY_MAP: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

/**
 * Next occurrence of the delivery weekday strictly after `from`.
 * Used when first scheduling a subscription.
 */
export function nextWeekday(from: Date, day: string): Date {
  const target = DAY_MAP[(day || '').toLowerCase()] ?? 6; // default Saturday
  const d = new Date(from);
  do {
    d.setDate(d.getDate() + 1);
  } while (d.getDay() !== target);
  return d;
}

/**
 * Advance a delivery date by the plan's frequency (weekly/biweekly/monthly),
 * snapping back onto the delivery weekday. Fixes the old bug where skip/resume
 * always added exactly 7 days regardless of cadence.
 */
export function advanceByFrequency(from: Date, day: string, frequency: string): Date {
  const base = new Date(from);
  if (frequency === 'monthly') {
    base.setMonth(base.getMonth() + 1);
  } else if (frequency === 'biweekly') {
    base.setDate(base.getDate() + 14);
  } else {
    base.setDate(base.getDate() + 7);
  }
  // Snap to the configured delivery weekday (search backward then forward one week).
  const target = DAY_MAP[(day || '').toLowerCase()] ?? base.getDay();
  const snapped = new Date(base);
  let guard = 0;
  while (snapped.getDay() !== target && guard < 7) {
    snapped.setDate(snapped.getDate() + 1);
    guard++;
  }
  return snapped;
}

type PlanForClient = {
  price: Prisma.Decimal | number | null;
  originalPrice?: Prisma.Decimal | number | null;
} & Record<string, unknown>;

export function serializePlan<T extends PlanForClient>(plan: T | null | undefined) {
  if (!plan) return plan;
  return {
    ...plan,
    price: plan.price != null ? Number(plan.price) : 0,
    originalPrice: plan.originalPrice != null ? Number(plan.originalPrice) : null,
  };
}

type SubscriptionForClient = {
  id: string;
  status: string;
  startDate: Date;
  nextDeliveryDate: Date;
  pausedUntil: Date | null;
  cancelledAt: Date | null;
  cancelReason: string | null;
  deliveryAddress: unknown;
  deliverySlotDay: string;
  deliverySlotTime: string;
  paymentMethod: string;
  totalDeliveries: number;
  skippedDeliveries: number;
  skippedDates: Date[];
  excludeItems: string[];
  preferences: string | null;
  createdAt: Date;
  updatedAt: Date;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  plan?: any;
};

/**
 * Reshape a Postgres subscription row into the object shape the front-end
 * (profile/subscriptions) expects — reconstructing the nested `deliverySlot`
 * and `customizations` that were flattened into columns.
 */
export function serializeSubscription(s: SubscriptionForClient) {
  return {
    _id: s.id,
    status: s.status,
    startDate: s.startDate,
    nextDeliveryDate: s.nextDeliveryDate,
    pausedUntil: s.pausedUntil,
    cancelledAt: s.cancelledAt,
    cancelReason: s.cancelReason,
    deliveryAddress: s.deliveryAddress,
    deliverySlot: { day: s.deliverySlotDay, timeSlot: s.deliverySlotTime },
    paymentMethod: s.paymentMethod,
    totalDeliveries: s.totalDeliveries,
    skippedDeliveries: s.skippedDeliveries,
    skippedDates: s.skippedDates,
    customizations: { excludeItems: s.excludeItems, preferences: s.preferences },
    plan: serializePlan(s.plan),
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
  };
}
