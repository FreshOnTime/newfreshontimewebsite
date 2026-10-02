import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import { sign } from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { POST } from '../app/api/orders/route';
import { prepareCheckout } from '../lib/checkoutService';
import { RecurringOrderService } from '../lib/services/recurringOrderService';

async function verify() {
  assert.equal(await prisma.user.count(), 0, "Use a fresh empty checkout_test_* schema");
  assert.equal(await prisma.product.count(), 0, "Use a fresh empty checkout_test_* schema");
  const user = await prisma.user.create({ data: { firstName: 'Integration fixture' } });
  const other = await prisma.user.create({ data: { firstName: 'Second fixture' } });
  const product = await prisma.product.create({ data: { name: 'Tomatoes', sku: 'INTEGRATION-TOMATO', slug: 'integration-tomato', price: 20, discountPercentage: 25, stockQty: 10 } });
  const address = { name: 'Fixture', phone: '0771234567', street: 'Market Road', city: 'Colombo', country: 'LK' };
  const body = { items: [{ productId: product.id, quantity: 2 }], shippingAddress: address };
  const token = (id = user.id) => sign({ userId: id, role: 'customer', type: 'access' }, process.env.JWT_SECRET!);
  const request = (key: string, payload: unknown = body, id = user.id) => new NextRequest('http://localhost/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token(id)}`, 'Idempotency-Key': key }, body: JSON.stringify(payload) });
  const results = await Promise.all([POST(request('concurrent-key'), undefined), POST(request('concurrent-key'), undefined)]);
  assert.deepEqual(results.map((result) => result.status).sort(), [200, 201]);
  const receipts = await Promise.all(results.map((result) => result.json()));
  assert.equal(receipts[0].data._id, receipts[1].data._id);
  assert.equal(receipts[0].data.total, 35);
  assert.equal(await prisma.order.count(), 1); assert.equal(await prisma.checkoutRequest.count(), 1);
  assert.equal((await prisma.product.findUniqueOrThrow({ where: { id: product.id } })).stockQty, 8);
  assert.equal((await POST(request('concurrent-key', { ...body, items: [{ productId: product.id, quantity: 3 }] }), undefined)).status, 409);
  await prisma.product.update({ where: { id: product.id }, data: { archived: true, stockQty: 0, price: 99 } });
  assert.equal((await POST(request('concurrent-key'), undefined)).status, 200);
  console.log('PASS concurrent deduplication, receipt replay, intent conflict and single reservation');

  await prisma.product.update({ where: { id: product.id }, data: { archived: false, stockQty: 2, price: 20 } });
  const competing = await Promise.all([POST(request('competing-key-a'), undefined), POST(request('competing-key-b'), undefined)]);
  assert.equal(competing.filter((result) => result.status === 201).length, 1);
  assert.equal((await prisma.product.findUniqueOrThrow({ where: { id: product.id } })).stockQty, 0);
  assert.equal(await prisma.order.count(), 2); assert.equal(await prisma.checkoutRequest.count(), 2);
  console.log('PASS competing checkouts cannot oversell');

  await prisma.product.update({ where: { id: product.id }, data: { stockQty: 10 } });
  const { quote } = await prepareCheckout(body.items);
  await prisma.product.update({ where: { id: product.id }, data: { price: 21 } });
  assert.equal((await POST(request('stale-quote-key', { ...body, quoteFingerprint: quote.fingerprint }), undefined)).status, 409);
  assert.equal(await prisma.checkoutRequest.count(), 2);
  assert.equal((await prisma.product.findUniqueOrThrow({ where: { id: product.id } })).stockQty, 10);
  // Inject a price change between the prepared quote and its transaction to
  // prove that the conditional reservation and retry claim roll back together.
  const transaction = prisma.$transaction.bind(prisma);
  prisma.$transaction = (async (...args: unknown[]) => {
    await prisma.product.update({ where: { id: product.id }, data: { price: 22 } });
    return (transaction as (...args: unknown[]) => Promise<unknown>)(...args);
  }) as typeof prisma.$transaction;
  try { assert.equal((await POST(request('price-race-key'), undefined)).status, 409); }
  finally { prisma.$transaction = transaction; }
  assert.equal(await prisma.checkoutRequest.count(), 2); assert.equal(await prisma.order.count(), 2);
  assert.equal((await prisma.product.findUniqueOrThrow({ where: { id: product.id } })).stockQty, 10);
  console.log('PASS stale quote and transaction-time price race leave no stock or retry claim');

  assert.equal((await POST(request('concurrent-key', body, other.id), undefined)).status, 201);
  assert.equal(await prisma.checkoutRequest.count(), 3);
  console.log('PASS retry keys are scoped to each customer');

  const due = new Date(Date.now() - 60000);
  const schedule = await prisma.order.create({ data: { customerId: user.id, orderNumber: 'INTEGRATION-REC', subtotal: 20, total: 25, shipping: 5, paymentMethod: 'cash', paymentStatus: 'paid', shippingAddress: address, isRecurring: true, scheduleStatus: 'active', nextDeliveryAt: due, recurrence: { daysOfWeek: [0,1,2,3,4,5,6] }, items: { create: [{ productId: product.id, sku: product.sku, name: product.name, qty: 2, price: 10, total: 20 }] } } });
  await prisma.product.update({ where: { id: product.id }, data: { stockQty: 0 } });
  await assert.rejects(RecurringOrderService.createNextOrderInstance(schedule.id), /INSUFFICIENT_STOCK/);
  assert.equal((await prisma.order.findUniqueOrThrow({ where: { id: schedule.id } })).nextDeliveryAt!.getTime(), due.getTime());
  assert.equal(await prisma.order.count({ where: { recurringSourceOrderId: schedule.id } }), 0);
  await prisma.product.update({ where: { id: product.id }, data: { stockQty: 10, price: 40 } });
  const deliveries = await Promise.all([RecurringOrderService.createNextOrderInstance(schedule.id), RecurringOrderService.createNextOrderInstance(schedule.id)]);
  assert.equal(deliveries.filter(Boolean).length, 1);
  const delivery = deliveries.find(Boolean)!;
  assert.equal(Number(delivery.total), 60); assert.equal(delivery.paymentStatus, 'pending');
  assert.equal((await prisma.product.findUniqueOrThrow({ where: { id: product.id } })).stockQty, 8);
  console.log('PASS unavailable recurring delivery rollback and overlapping schedule deduplication at current prices');
}
verify().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
