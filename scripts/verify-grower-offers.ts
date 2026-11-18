import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { NextRequest } from 'next/server';
import { GET as board, POST as submitOffer } from '../app/api/supply/route';
import { GET as queue, PATCH as decide, POST as publish } from '../app/api/admin/supply/route';
import prisma from '../lib/prisma';

export async function verifyGrowerOffers(adminRequest: (path: string, method: string, payload?: unknown) => NextRequest) {
  const path = '/api/admin/supply';
  const demand = { id: randomUUID(), product: 'Test beans', grade: 'Tender', unit: 'kg', quantity: 10, area: 'Pilot area', pickup: '2099-11-19', deadline: '2099-11-18' };
  assert.equal((await queue(new NextRequest('http://localhost' + path))).status, 401);
  assert.equal((await publish(adminRequest(path, 'POST', demand))).status, 201);
  const { requests } = await (await board()).json();
  const requestId = requests.find((row: { product: string }) => row.product === demand.product).id;
  const offer = { requestId, product: demand.product, unit: 'kg', price: 300, quantity: 7, area: demand.area, ready: demand.pickup, phone: '0771234567', submissionId: randomUUID() };
  const post = (body: unknown) => submitOffer(new NextRequest('http://localhost/api/supply', { method: 'POST', body: JSON.stringify(body) }));
  assert.equal((await post(offer)).status, 200);
  assert.equal((await post(offer)).status, 200);
  assert.equal(await prisma.supplyOffer.count({ where: { requestId } }), 1);
  assert.equal((await post({ ...offer, submissionId: randomUUID() })).status, 200);
  const offers = await prisma.supplyOffer.findMany({ where: { requestId } });
  const act = (id: string, action: string, fields = {}) => decide(adminRequest(path, 'PATCH', { id, action, ...fields }));
  for (const row of offers) {
    assert.equal((await act(row.id, 'handover')).status, 409);
    assert.equal((await act(row.id, 'propose', { agreedQty: 7, agreedPrice: 280, terms: 'Bag separately. Friday pickup. Pay on collection.' })).status, 200);
  }
  const decisions = await Promise.all(offers.map(row => act(row.id, 'confirm')));
  assert.deepEqual(decisions.map(r => r.status).sort(), [200, 409]);
  const winner = offers[decisions.findIndex(r => r.status === 200)];
  assert.equal((await act(winner.id, 'handover')).status, 200);
  assert.equal((await act(winner.id, 'handover')).status, 409);
  const report = await (await queue(adminRequest(path, 'GET'))).json();
  assert.equal(report.metrics.growers, 1);
  assert.equal(Number(report.requests.find((r: { id: string }) => r.id === requestId).remaining), 3);
  assert.ok(!JSON.stringify(await (await board()).json()).includes('771234567'));
  console.log('PASS grower offer retries, concurrent confirmations, handover and pilot metrics');
}
