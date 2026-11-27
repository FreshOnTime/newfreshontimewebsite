/* Isolated screenshot fixtures only. Never run against a real site or database. */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import assert from 'node:assert/strict';
const url = new URL(process.env.DATABASE_URL || 'postgresql://invalid');
assert.equal(url.hostname, 'localhost', 'Visual fixtures require local PostgreSQL');
assert.equal(url.pathname, '/freshpick_visual', 'Visual fixtures require a dedicated database');
assert.equal(process.env.FRESHPICK_VISUAL_FIXTURES, '1', 'Explicit fixture opt-in required');
const db = new PrismaClient();
async function main() {
  const supplier = await db.supplier.create({ data: {
    name: 'Visual review fixture — bakery', contactName: 'Test maker', phone: '+12025550101',
    makerHandle: 'visual-review-bakery', makerPublished: true, makerBio: 'A fictional test account for reviewing a sparse storefront. Not a real business.',
    makerTown: 'Test town', makerWhatsApp: '+12025550101', makerFulfilment: 'Pickup',
    applicationStatus: 'approved', status: 'active', businessType:'bakery', businessSpecialties:['bread-pastries','food-hampers'],
  }});
  const user = await db.user.create({ data: { firstName: 'Test maker', email: 'visual-review@example.invalid',
    passwordHash: await bcrypt.hash('VisualFixtureOnly123!', 10), role: 'supplier', supplierId: supplier.id, isEmailVerified: true }});
  await db.liveVendor.create({data:{supplierId:supplier.id,kind:'truck',approval:'approved',reviewedBy:'fixture-admin',reviewedAt:new Date(),location:'Fictional test stop',area:'Test town',latitude:6.9,longitude:79.9,note:'Isolated fixture, not a real serving location',checkedInAt:new Date(),servingUntil:new Date(Date.now()+6*3600000)}});
  await db.user.create({data:{firstName:'Test admin',email:'visual-admin@example.invalid',passwordHash:await bcrypt.hash('VisualFixtureOnly123!',10),role:'admin',isEmailVerified:true}});
  await db.discoveryContent.create({data:{kind:'event',slug:'visual-review-event',title:'Visual review food event',category:'Workshop',summary:'Fictional event used only in isolated browser testing.',body:'Test content, not a real event.',sourceUrl:'https://example.org/fixture',sourceName:'Test fixture',location:'Test venue',startsAt:new Date(Date.now()+86400000),endsAt:new Date(Date.now()+90000000),published:true,publishedAt:new Date(),relatedDishes:['kottu']}});
  const item = await db.makerItem.create({ data: { supplierId:supplier.id, slug:'visual-review-loaf', name:'Visual review loaf',
    description:'Test listing, not for sale. Used to inspect photo, price, fulfilment and enquiry placement.', kind:'Bakery', price:850, madeToOrder:true, published:true }});
  await db.makerItem.create({ data:{supplierId:supplier.id,slug:'visual-review-rolls',name:'Visual review rolls',description:'Second fixture listing.',kind:'Bakery',price:450,madeToOrder:false,published:true}});
  await db.makerItem.create({data:{supplierId:supplier.id,slug:'visual-review-assortment',name:'Visual review assortment',description:'Fictional gift assortment for category testing.',kind:'Food gifts',published:true}});
  await db.makerBatch.create({ data:{itemId:item.id,note:'Test pickup note — not a real location.',price:850,cutoff:new Date(Date.now()+86400000),readyAt:new Date(Date.now()+172800000)}});
  await db.blog.create({ data:{supplierId:supplier.id,authorId:user.id,slug:'visual-review-story',title:'A morning in the test kitchen',category:'Behind the business',excerpt:'A fictional article for the layout review only.',content:'## Starting early\n\nThis test text exercises the reading column and tagged items. It is not a reported story.\n\n## At the counter\n\nThis paragraph is deliberately longer to show the line length, spacing and hierarchy alongside a tagged test item.',published:true,publishedAt:new Date(),makerItems:{create:{itemId:item.id}}}});
}
main().finally(()=>db.$disconnect()).catch(err=>{console.error(err);process.exitCode=1;});
