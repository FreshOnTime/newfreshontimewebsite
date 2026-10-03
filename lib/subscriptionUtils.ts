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

export function isValidDeliveryDay(day: string): boolean {
  return Object.prototype.hasOwnProperty.call(DAY_MAP, (day || '').toLowerCase());
}

// Sri Lanka has a fixed UTC+05:30 offset; use UTC calendar methods so host TZ
// cannot shift a customer's chosen weekday or monthly boundary.
const COLOMBO_OFFSET = 330 * 60_000;
const businessDay = (date: Date) => {
  const local = new Date(date.getTime()+COLOMBO_OFFSET);
  return new Date(Date.UTC(local.getUTCFullYear(),local.getUTCMonth(),local.getUTCDate()));
};
const instant = (date: Date) => new Date(date.getTime()-COLOMBO_OFFSET);
export function nextWeekday(from: Date, day: string): Date {
  const target=DAY_MAP[(day||'').toLowerCase()];
  if(target===undefined)throw new Error('Invalid delivery day');
  const date=businessDay(from);
  do{date.setUTCDate(date.getUTCDate()+1);}while(date.getUTCDay()!==target);
  return instant(date);
}
export function advanceByFrequency(from: Date, day: string, frequency: string): Date {
  const target=DAY_MAP[(day||'').toLowerCase()];
  if(target===undefined)throw new Error('Invalid delivery day');
  const date=businessDay(from);
  if(frequency==='monthly'){
    const original=date.getUTCDate();date.setUTCDate(1);date.setUTCMonth(date.getUTCMonth()+1);
    const last=new Date(Date.UTC(date.getUTCFullYear(),date.getUTCMonth()+1,0)).getUTCDate();date.setUTCDate(Math.min(original,last));
  }else{date.setUTCDate(date.getUTCDate()+(frequency==='biweekly'?14:7));}
  while(date.getUTCDay()!==target)date.setUTCDate(date.getUTCDate()+1);
  return instant(date);
}

type PlanForClient = {
  id?: string;
  _id?: string;
  price: Prisma.Decimal | number | null;
  originalPrice?: Prisma.Decimal | number | null;
} & Record<string, unknown>;

export function serializePlan<T extends PlanForClient>(plan: T | null | undefined) {
  if (!plan) return plan;
  const id = plan._id || plan.id;

  return {
    ...plan,
    ...(id ? { _id: id } : {}),
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
