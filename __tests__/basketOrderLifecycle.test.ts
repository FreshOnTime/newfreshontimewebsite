import type { Prisma, SubscriptionDelivery } from '@prisma/client';
import { syncBasketDelivery, validateBasketOrderTransition } from '@/lib/basketOrderLifecycle';
const updateMany=jest.fn(), update=jest.fn();
const tx={subscriptionDelivery:{updateMany},subscription:{update}} as unknown as Prisma.TransactionClient;
const delivery={id:'d',subscriptionId:'s',status:'pending',version:2} as SubscriptionDelivery;
beforeEach(()=>{jest.clearAllMocks();updateMany.mockResolvedValue({count:1});});
it('counts a claimed completion once and keeps delivered refunds fulfilled',async()=>{
  await syncBasketDelivery(tx,delivery,'delivered');
  expect(update).toHaveBeenCalledTimes(1);
  await syncBasketDelivery(tx,{...delivery,status:'delivered'},'refunded');
  expect(update).toHaveBeenCalledTimes(1);expect(updateMany).toHaveBeenCalledTimes(1);
});
it('does not count a losing delivery version claim',async()=>{
  updateMany.mockResolvedValue({count:0});
  await expect(syncBasketDelivery(tx,delivery,'delivered')).rejects.toThrow('changed');
  expect(update).not.toHaveBeenCalled();
});
it('mirrors cancellation and address changes without incrementing deliveries',async()=>{
  await syncBasketDelivery(tx,delivery,'cancelled');
  expect(updateMany.mock.calls[0][0].data.status).toBe('cancelled');
  await syncBasketDelivery(tx,delivery,'processing',{street:'New street'});
  expect(updateMany.mock.calls[1][0].data).toMatchObject({status:'confirmed',deliveryAddress:{street:'New street'}});
  expect(update).not.toHaveBeenCalled();
});
it('rejects reopening cancelled deliveries and cancelling shipped baskets',async()=>{
  await expect(syncBasketDelivery(tx,{...delivery,status:'cancelled'},'delivered')).rejects.toThrow('no longer active');
  expect(()=>validateBasketOrderTransition('shipped','cancelled')).toThrow();
  expect(()=>validateBasketOrderTransition('delivered','processing')).toThrow();
  expect(()=>validateBasketOrderTransition('delivered','refunded')).not.toThrow();
});
