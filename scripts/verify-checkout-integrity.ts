import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import { sign } from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { POST as subscribeNewsletter } from '../app/api/newsletter/route';
import { POST as unsubscribeNewsletter } from '../app/api/newsletter/unsubscribe/route';
import { unsubscribeToken } from '../lib/newsletterTokens';
import { POST as createSubscription } from '../app/api/subscriptions/route';
import { SubscriptionDeliveryService } from '../lib/services/subscriptionDeliveryService';
import { PUT as updateBasketOrder } from '../app/api/admin/orders/[id]/route';
import { PATCH as customerOrderAction, PUT as customerOrderUpdate, DELETE as deleteCustomerOrder } from '../app/api/orders/[id]/route';
import { PUT as updateBasketPlan } from '../app/api/subscription-plans/[id]/route';
import { POST as retryBasket } from '../app/api/admin/subscriptions/[id]/fulfill/route';
import { GET as basketQueue } from '../app/api/admin/subscription-deliveries/route';
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
  const plan = await prisma.subscriptionPlan.create({data:{name:'Fixture basket',slug:'fixture-basket',description:'Test',shortDescription:'Test',price:100, maxSubscribers:1}});
  const subBody={planId:plan.id,deliveryAddress:address,deliverySlot:{day:'monday',timeSlot:'Anytime'},paymentMethod:'cod'};
  const subRequest=(id:string,key:string,payload:unknown=subBody)=>new NextRequest('http://localhost/api/subscriptions',{method:'POST',headers:{Authorization:`Bearer ${token(id)}`,'Idempotency-Key':key,'Content-Type':'application/json'},body:JSON.stringify(payload)});
  const subscriptions=await Promise.all([createSubscription(subRequest(user.id,'basket-retry-key')),createSubscription(subRequest(user.id,'basket-retry-key'))]);
  assert.deepEqual(subscriptions.map(row=>row.status).sort(),[200,201]);
  assert.equal(await prisma.subscription.count(),1);assert.equal(await prisma.subscriptionRequest.count(),1);
  assert.equal((await prisma.subscriptionPlan.findUniqueOrThrow({where:{id:plan.id}})).currentSubscribers,1);
  assert.equal((await createSubscription(subRequest(other.id,'basket-capacity-key'))).status,409);
  assert.equal(await prisma.subscriptionRequest.count(),1);
  assert.equal((await createSubscription(subRequest(user.id,'basket-other-key'))).status,409);
  assert.equal((await createSubscription(subRequest(user.id,'basket-retry-key',{...subBody,deliverySlot:{day:'friday'}}))).status,409);
  await prisma.subscriptionPlan.update({where:{id:plan.id},data:{isActive:false}});
  assert.equal((await createSubscription(subRequest(user.id,'basket-retry-key'))).status,200);
  console.log('PASS basket retry receipts, per-customer plan locks, capacity and rollback');
  await prisma.subscriptionPlan.update({where:{id:plan.id},data:{isActive:true}});
  const sub=await prisma.subscription.findFirstOrThrow();
  await prisma.subscription.update({where:{id:sub.id},data:{nextDeliveryDate:due}});
  const basketDeliveries=await Promise.all([SubscriptionDeliveryService.createPendingDelivery(sub.id),SubscriptionDeliveryService.createPendingDelivery(sub.id)]);
  assert.equal(basketDeliveries.filter(Boolean).length,1);
  const basket=basketDeliveries.find(Boolean)!;
  const completion=await Promise.allSettled([SubscriptionDeliveryService.transitionDelivery(basket.id,'deliver',0),SubscriptionDeliveryService.transitionDelivery(basket.id,'deliver',0)]);
  assert.ok(completion.some(result=>result.status==='fulfilled'));
  await SubscriptionDeliveryService.transitionDelivery(basket.id,'deliver',0);
  assert.equal((await prisma.subscription.findUniqueOrThrow({where:{id:sub.id}})).totalDeliveries,1);
  assert.equal(await prisma.subscriptionDelivery.count(),1);
  console.log('PASS overlapping basket schedule and completion count exactly once');

  // Opt in only after real catalogue mapping. Manual records above remain unchanged.
  const admin = await prisma.user.create({ data: { firstName: 'Basket operator', role: 'admin' } });
  const adminToken = sign({ userId: admin.id, role: 'admin', type: 'access' }, process.env.JWT_SECRET!);
  const adminRequest = (path: string, method: string, payload?: unknown) => new NextRequest(`http://localhost${path}`, { method, headers: { cookie: `accessToken=${adminToken}`, 'Content-Type': 'application/json' }, ...(payload === undefined ? {} : { body: JSON.stringify(payload) }) });
  const ctx = (id: string) => ({ params: Promise.resolve({ id }) });
  const mappedPlan = await prisma.subscriptionPlan.create({ data: { name: 'Mapped basket', slug: 'mapped-basket', description: 'Test', shortDescription: 'Test', price: 100.01, inventoryManaged: true, contents: { create: [
    { name: 'Tomatoes', quantity: '1kg', category: 'Produce', productId: product.id, units: 2 },
    { name: 'Extra tomatoes', quantity: '500g', category: 'Produce', productId: product.id, units: 1 },
  ] } } });
  const oldDue = new Date(Date.now() - 35 * 86400000);
  const managedSub = await prisma.subscription.create({ data: { userId: user.id, planId: mappedPlan.id, status: 'active', startDate: oldDue, nextDeliveryDate: oldDue, deliveryAddress: address, deliverySlotDay: 'monday', deliverySlotTime: 'Anytime' } });
  await prisma.subscription.update({where:{id:managedSub.id},data:{preferences:'No tomatoes, please'}});
  await assert.rejects(SubscriptionDeliveryService.createPendingDelivery(managedSub.id),/custom requests/);
  await prisma.subscription.update({where:{id:managedSub.id},data:{preferences:null}});
  await prisma.product.update({ where: { id: product.id }, data: { stockQty: 2 } });
  const countBefore = await prisma.order.count();
  await assert.rejects(SubscriptionDeliveryService.createPendingDelivery(managedSub.id), /Insufficient stock/);
  assert.equal(await prisma.order.count(), countBefore);
  assert.equal(await prisma.subscriptionDelivery.count({ where: { subscriptionId: managedSub.id } }), 0);
  const blocked = await prisma.subscription.findUniqueOrThrow({ where: { id: managedSub.id } });
  assert.equal(blocked.nextDeliveryDate.getTime(), oldDue.getTime()); assert.match(blocked.fulfillmentError!, /Insufficient stock/);
  assert.equal((await prisma.product.findUniqueOrThrow({ where: { id: product.id } })).stockQty, 2);
  const blockedQueue = await basketQueue(adminRequest('/api/admin/subscription-deliveries?status=blocked', 'GET'));
  assert.equal(blockedQueue.status, 200); assert.equal((await blockedQueue.json()).deliveries[0].id, managedSub.id);
  await prisma.user.update({ where: { id: user.id }, data: { email: 'basket-fixture@example.com' } });
  await prisma.product.update({ where: { id: product.id }, data: { stockQty: 6 } });
  const retries = await Promise.all([retryBasket(adminRequest(`/api/admin/subscriptions/${managedSub.id}/fulfill`, 'POST'),ctx(managedSub.id)),retryBasket(adminRequest(`/api/admin/subscriptions/${managedSub.id}/fulfill`, 'POST'),ctx(managedSub.id))]);
  assert.deepEqual(retries.map(row => row.status).sort(), [200,409]);
  const managedDelivery = await prisma.subscriptionDelivery.findFirstOrThrow({ where: { subscriptionId: managedSub.id }, include: { order: { include: { items: true } } } });
  assert.ok(managedDelivery.order); assert.equal(Number(managedDelivery.order.total),100.01); assert.equal(Number(managedDelivery.order.shipping),0); assert.equal(managedDelivery.order.paymentStatus,'pending');
  assert.equal(managedDelivery.order.items.reduce((sum,item) => sum + Math.round(Number(item.total)*100),0),10001);
  assert.equal(managedDelivery.order.items.reduce((sum,item) => sum + item.qty,0),3);
  assert.equal((await prisma.product.findUniqueOrThrow({where:{id:product.id}})).stockQty,3);
  assert.equal((await prisma.subscription.findUniqueOrThrow({where:{id:managedSub.id}})).fulfillmentError,null);
  assert.ok((await prisma.subscription.findUniqueOrThrow({where:{id:managedSub.id}})).nextDeliveryDate > new Date());
  assert.equal(await prisma.emailOutbox.count({where:{dedupeKey:`order-confirmation:${managedDelivery.order.id}`}}),1);
  const orderPath = `/api/orders/${managedDelivery.order.id}`;
  const orderReq = (method: string, payload?: unknown) => new NextRequest(`http://localhost${orderPath}`, { method, headers: { Authorization: `Bearer ${token(user.id)}`, 'Content-Type':'application/json' }, body: JSON.stringify(payload) });
  assert.equal((await customerOrderUpdate(orderReq('PUT',{shippingAddress:{...address,street:'New Market Road'}}),ctx(managedDelivery.order.id))).status,200);
  assert.equal((await prisma.subscriptionDelivery.findUniqueOrThrow({where:{id:managedDelivery.id}})).deliveryAddress && ((await prisma.subscriptionDelivery.findUniqueOrThrow({where:{id:managedDelivery.id}})).deliveryAddress as {street:string}).street,'New Market Road');
  await assert.rejects(SubscriptionDeliveryService.transitionDelivery(managedDelivery.id,'deliver',0),/changed/);
  assert.equal((await updateBasketOrder(adminRequest(`/api/admin/orders/${managedDelivery.order.id}`,'PUT',{total:1}),ctx(managedDelivery.order.id))).status,400);
  const cancels = await Promise.all([customerOrderAction(orderReq('PATCH',{action:'cancel'}),ctx(managedDelivery.order.id)),customerOrderAction(orderReq('PATCH',{action:'cancel'}),ctx(managedDelivery.order.id))]);
  assert.ok(cancels.some(row => row.status === 200));
  assert.equal((await prisma.product.findUniqueOrThrow({where:{id:product.id}})).stockQty,6);
  assert.equal((await prisma.subscriptionDelivery.findUniqueOrThrow({where:{id:managedDelivery.id}})).status,'cancelled');
  assert.equal((await prisma.subscription.findUniqueOrThrow({where:{id:managedSub.id}})).totalDeliveries,0);
  const adminDelete = new NextRequest(`http://localhost${orderPath}`,{method:'DELETE',headers:{Authorization:`Bearer ${sign({userId:admin.id,role:'admin',type:'access'},process.env.JWT_SECRET!)}`}});
  assert.equal((await deleteCustomerOrder(adminDelete,ctx(managedDelivery.order.id))).status,409);
  // A second basket proves order and queue delivery actions share the same counter claim.
  const secondDue = new Date(due.getTime()+1000);
  await prisma.subscription.update({where:{id:managedSub.id},data:{nextDeliveryDate:secondDue}});
  const second = (await SubscriptionDeliveryService.createPendingDelivery(managedSub.id))!;
  assert.ok(second.orderId);
  const orderAndQueue = await Promise.allSettled([
    SubscriptionDeliveryService.transitionDelivery(second.id,'deliver',0),
    updateBasketOrder(adminRequest(`/api/admin/orders/${second.orderId}`,'PUT',{status:'delivered'}),ctx(second.orderId!)),
  ]);
  assert.ok(orderAndQueue.some(row => row.status === 'fulfilled'));
  assert.equal((await prisma.subscription.findUniqueOrThrow({where:{id:managedSub.id}})).totalDeliveries,1);
  assert.equal((await prisma.order.findUniqueOrThrow({where:{id:second.orderId!}})).status,'delivered');
  assert.equal((await updateBasketOrder(adminRequest(`/api/admin/orders/${second.orderId}`,'PUT',{status:'refunded'}),ctx(second.orderId!))).status,200);
  assert.equal((await prisma.product.findUniqueOrThrow({where:{id:product.id}})).stockQty,3);
  assert.equal((await prisma.subscriptionDelivery.findUniqueOrThrow({where:{id:second.id}})).status,'delivered');
  assert.equal((await prisma.subscription.findUniqueOrThrow({where:{id:managedSub.id}})).totalDeliveries,1);
  // Versioned content replacement is persisted atomically; stale editors lose.
  const versioned = await prisma.subscriptionPlan.findUniqueOrThrow({where:{id:mappedPlan.id}});
  const planUpdate = { version: versioned.updatedAt.toISOString(), contents: [{name:'Updated tomatoes',quantity:'1kg',category:'Produce',productId:product.id,units:2}] };
  assert.equal((await updateBasketPlan(adminRequest(`/api/subscription-plans/${mappedPlan.id}`,'PUT',planUpdate),ctx(mappedPlan.id))).status,200);
  assert.equal((await updateBasketPlan(adminRequest(`/api/subscription-plans/${mappedPlan.id}`,'PUT',planUpdate),ctx(mappedPlan.id))).status,409);
  assert.equal((await prisma.planContent.findMany({where:{planId:mappedPlan.id}})).length,1);
  console.log('PASS mapped basket rollback/retry, exact price, stock release, order/queue concurrency, refund and plan edit conflicts');

  const newsletterRequest=()=>new Request('http://localhost/api/newsletter',{method:'POST',body:JSON.stringify({email:'integration@example.com',source:'footer'})});
  const newsletterResults=await Promise.all([subscribeNewsletter(newsletterRequest()),subscribeNewsletter(newsletterRequest())]);
  assert.deepEqual(newsletterResults.map(result=>result.status),[200,200]);
  assert.equal(await prisma.subscriber.count(),1);
  assert.equal(await prisma.emailOutbox.count({where:{dedupeKey:{startsWith:'newsletter-welcome:'}}}),1);
  const subscriber=await prisma.subscriber.findUniqueOrThrow({where:{email:'integration@example.com'}});
  const unsubscribeRequest=(version:number)=>new Request('http://localhost/api/newsletter/unsubscribe',{method:'POST',body:JSON.stringify({token:unsubscribeToken(subscriber.id,version)})});
  assert.equal((await unsubscribeNewsletter(unsubscribeRequest(0))).status,200);
  assert.equal((await subscribeNewsletter(newsletterRequest())).status,200);
  assert.equal((await unsubscribeNewsletter(unsubscribeRequest(0))).status,410);
  assert.equal((await prisma.subscriber.findUniqueOrThrow({where:{id:subscriber.id}})).unsubscribeVersion,1);
  assert.equal(await prisma.emailOutbox.count({where:{dedupeKey:{startsWith:'newsletter-welcome:'}}}),2);
  console.log('PASS concurrent newsletter signup, atomic welcome queue and old-link invalidation');

}
verify().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
