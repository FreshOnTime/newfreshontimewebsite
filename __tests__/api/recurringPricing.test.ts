import prisma from '@/lib/prisma';
import { RecurringOrderService } from '@/lib/services/recurringOrderService';
jest.mock('@/lib/prisma', () => ({ __esModule: true, default: { order: { findUnique: jest.fn() }, user: { findUnique: jest.fn() }, $transaction: jest.fn() } }));
jest.mock('@/lib/services/mailService', () => ({ sendOrderEmail: jest.fn() }));
const db = prisma as unknown as { order: { findUnique: jest.Mock }; user: { findUnique: jest.Mock }; $transaction: jest.Mock };
const tx = { order: { findUnique: jest.fn(), updateMany: jest.fn(), create: jest.fn() }, product: { findMany: jest.fn(), updateMany: jest.fn() } };
const due = new Date('2026-09-30');
const schedule = { id: 'schedule1', isRecurring: true, scheduleStatus: 'active', nextDeliveryAt: due, customerId: 'customer1', recurrence: { daysOfWeek: [1, 3] }, shippingAddress: { city: 'Colombo', country: 'LK' }, items: [{ productId: 'p1', qty: 2, price: 10, total: 20 }], subtotal: 20, total: 25, paymentStatus: 'paid', paymentMethod: 'cash' };
beforeEach(() => {
  jest.clearAllMocks(); db.order.findUnique.mockResolvedValue(schedule); db.user.findUnique.mockResolvedValue(null);
  db.$transaction.mockImplementation(async (fn: (tx: unknown) => unknown) => fn(tx));
  tx.order.findUnique.mockResolvedValue(schedule); tx.order.updateMany.mockResolvedValue({ count: 1 });
  tx.product.findMany.mockResolvedValue([{ id: 'p1', sku: 'TOMATO', name: 'Tomatoes', price: 40, discountPercentage: 25, stockQty: 10 }]);
  tx.product.updateMany.mockResolvedValue({ count: 1 }); tx.order.create.mockImplementation(async ({ data }) => ({ ...data, id: 'delivery1' }));
});
it('prices the delivery at current sale prices and starts its payment state as pending', async () => {
  const result = await RecurringOrderService.createNextOrderInstance('schedule1');
  expect(result).toMatchObject({ subtotal: 60, shipping: 0, total: 60, paymentStatus: 'pending', items: { create: [{ price: 30, total: 60 }] } });
});
it('creates no order or reservation for unavailable inventory', async () => {
  tx.product.findMany.mockResolvedValue([]);
  await expect(RecurringOrderService.createNextOrderInstance('schedule1')).rejects.toThrow('INSUFFICIENT_STOCK');
  expect(tx.order.create).not.toHaveBeenCalled(); expect(tx.product.updateMany).not.toHaveBeenCalled();
});
it('aborts delivery creation when another order consumes the stock during reservation', async () => {
  tx.product.updateMany.mockResolvedValue({ count: 0 });
  await expect(RecurringOrderService.createNextOrderInstance('schedule1')).rejects.toThrow('INSUFFICIENT_STOCK'); expect(tx.order.create).not.toHaveBeenCalled();
});
it('does not reserve stock after losing the concurrent due-date claim', async () => {
  tx.order.updateMany.mockResolvedValue({ count: 0 }); expect(await RecurringOrderService.createNextOrderInstance('schedule1')).toBeNull(); expect(tx.product.updateMany).not.toHaveBeenCalled();
});
