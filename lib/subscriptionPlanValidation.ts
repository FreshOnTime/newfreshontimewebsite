import type { Prisma } from '@prisma/client';
export class PlanWriteError extends Error { constructor(message:string,public status=400){super(message);} }
export async function validatePlanInventory(tx:Prisma.TransactionClient,inventoryManaged:boolean,contents:{productId:string|null;units:number}[]) {
  if(inventoryManaged&&(!contents.length||contents.some(item=>!item.productId)))throw new PlanWriteError('Map every basket item to a catalogue product before enabling stock tracking.');
  const ids=[...new Set(contents.map(item=>item.productId).filter((id):id is string=>!!id))];
  if(!ids.length)return;
  const products=await tx.product.findMany({where:{id:{in:ids},archived:false},select:{id:true}});
  if(products.length!==ids.length)throw new PlanWriteError('One or more mapped products are unavailable. Select active catalogue products.');
  const totals=new Map<string,number>();
  for(const item of contents)if(item.productId)totals.set(item.productId,(totals.get(item.productId)||0)+item.units);
  if([...totals.values()].some(value=>value>10000))throw new PlanWriteError('A basket cannot reserve more than 10,000 stock units of one product.');
}
