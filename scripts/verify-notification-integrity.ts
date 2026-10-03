import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import { sign } from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { POST as send } from '../app/api/admin/notifications/route';
import { GET as inbox, PATCH as read } from '../app/api/notifications/route';

/** Runs only through the guarded disposable checkout_test_* harness. */
export async function verifyNotificationIntegrity(adminId: string, customerId: string, otherId: string) {
  const request = (actor: string, method = 'GET', body?: unknown, query = '') => new NextRequest('http://localhost/api/notifications' + query, {
    method, headers: { cookie: `accessToken=${sign({ userId: actor, type: 'access', role: actor === adminId ? 'admin' : 'customer' }, process.env.JWT_SECRET!)}` }, ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const body = { title: 'Fixture broadcast', message: 'Market update', link: '/products', submissionId: '00fcc4fa-674f-4fcd-84d9-f56d8517c807' };
  const sends = await Promise.all([send(request(adminId, 'POST', body)), send(request(adminId, 'POST', body))]);
  assert.deepEqual(sends.map(row => row.status).sort(), [200, 201]);
  const broadcast = (await sends[0].json()).data._id as string;
  assert.equal(await prisma.notification.count(), 1);
  assert.equal(await prisma.auditLog.count({ where: { action: 'send_notification', resourceId: broadcast } }), 1);
  assert.equal((await send(request(adminId, 'POST', { ...body, message: 'Changed' }))).status, 409);
  const targeted = await send(request(adminId, 'POST', { title: 'Private fixture', message: 'Only for the second customer', targetUserId: otherId }));
  assert.equal(targeted.status, 201);
  const privateId = (await targeted.json()).data._id as string;
  assert.equal((await read(request(customerId, 'PATCH', { ids: [broadcast, privateId] }))).status, 404);
  assert.equal(await prisma.notificationRead.count(), 0);
  const reads = await Promise.all([read(request(customerId, 'PATCH', { ids: [broadcast] })), read(request(customerId, 'PATCH', { ids: [broadcast] }))]);
  assert.ok(reads.every(row => row.status === 200));
  assert.equal(await prisma.notificationRead.count({ where: { notificationId: broadcast } }), 1);
  const mine = await inbox(request(customerId));
  assert.equal(mine.headers.get('Cache-Control'), 'private, no-store');
  const mineData = await mine.json();
  assert.equal(mineData.data.length, 1); assert.equal(mineData.data[0].isRead, true); assert.equal(mineData.unreadCount, 0);
  const otherData = await (await inbox(request(otherId))).json();
  assert.equal(otherData.data.length, 2); assert.equal(otherData.unreadCount, 2); assert.equal(otherData.data.find((row: { _id: string }) => row._id === broadcast).isRead, false);
  assert.equal((await send(request(customerId, 'POST', body))).status, 403);
  assert.equal((await send(request(adminId, 'POST', { ...body, link: '//evil.example' }))).status, 400);
  console.log('PASS PostgreSQL notification retry dedupe, audit, recipient isolation and concurrent per-account reads');
}
