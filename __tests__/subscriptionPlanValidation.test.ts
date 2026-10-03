import { createPlanSchema, updatePlanSchema } from '@/lib/subscriptionPlanSchema';
import { validatePlanInventory } from '@/lib/subscriptionPlanValidation';
import type { Prisma } from '@prisma/client';
const findMany = jest.fn();
const tx = { product: { findMany } } as unknown as Prisma.TransactionClient;
beforeEach(() => findMany.mockReset());
it('preserves manual plans and requires complete inventory mappings', async () => {
  await expect(validatePlanInventory(tx,false,[])).resolves.toBeUndefined();
  expect(findMany).not.toHaveBeenCalled();
  await expect(validatePlanInventory(tx,true,[])).rejects.toThrow('Map every');
  await expect(validatePlanInventory(tx,true,[{ productId: null, units:1 }])).rejects.toThrow('Map every');
});
it('rejects archived or missing products and excessive combined units', async () => {
  findMany.mockResolvedValue([]);
  await expect(validatePlanInventory(tx,true,[{ productId:'a',units:1 }])).rejects.toThrow('unavailable');
  findMany.mockResolvedValue([{id:'a'}]);
  await expect(validatePlanInventory(tx,true,[{ productId:'a',units:6000 },{ productId:'a',units:5000 }])).rejects.toThrow('10,000');
});
it('coerces form amounts and rejects fractional inventory, invalid prices, and unversioned writes', () => {
  const plan={name:'Basket', description:'A basket', shortDescription:'Test', price:'100.50'};
  expect(createPlanSchema.parse(plan).inventoryManaged).toBe(false);
  for(const price of [0,-1,'12.333','NaN']) expect(createPlanSchema.safeParse({...plan,price}).success).toBe(false);
  expect(createPlanSchema.safeParse({...plan,contents:[{name:'Fruit',quantity:'1kg',units:0.5}]}).success).toBe(false);
  expect(updatePlanSchema.safeParse({price:10}).success).toBe(false);
});
