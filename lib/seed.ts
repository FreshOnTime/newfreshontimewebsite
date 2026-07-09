import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categoriesData = [
  { slug: 'fresh-produce', name: 'Fresh Produce', description: 'Farm-fresh vegetables and fruits', isActive: true, sortOrder: 1 },
  { slug: 'dairy-eggs', name: 'Dairy & Eggs', description: 'Fresh dairy products and eggs', isActive: true, sortOrder: 2 },
  { slug: 'meat-seafood', name: 'Meat & Seafood', description: 'Premium quality meats & fresh seafood', isActive: true, sortOrder: 3 },
  { slug: 'pantry-staples', name: 'Pantry Staples', description: 'Rice, sugar, spices & cooking essentials', isActive: true, sortOrder: 4 },
  { slug: 'bakery', name: 'Bakery', description: 'Fresh bread & baked goods', isActive: true, sortOrder: 5 },
  { slug: 'frozen-foods', name: 'Frozen Foods', description: 'Frozen vegetables, meals & ice cream', isActive: true, sortOrder: 6 },
  { slug: 'beverages', name: 'Beverages', description: 'Juices, soft drinks & water', isActive: true, sortOrder: 7 },
  { slug: 'snacks', name: 'Snacks', description: 'Chips, crackers & healthy snacks', isActive: true, sortOrder: 8 },
];

const baseCatalog = [
  { name: 'Organic Bananas', category: 'fresh-produce', basePrice: 280, tags: ['organic','fruit'], image: '/banana.avif' },
  { name: 'Carrots', category: 'fresh-produce', basePrice: 200, tags: ['vegetable'], image: '/placeholder.svg' },
  { name: 'Spinach', category: 'fresh-produce', basePrice: 120, tags: ['leafy greens'], image: '/placeholder.svg' },
  { name: 'Milk', category: 'dairy-eggs', basePrice: 320, tags: ['dairy'], image: '/placeholder.svg' },
  { name: 'Eggs (10)', category: 'dairy-eggs', basePrice: 700, tags: ['eggs'], image: '/placeholder.svg' },
  { name: 'Chicken Breast', category: 'meat-seafood', basePrice: 1250, tags: ['meat'], image: '/placeholder.svg' },
  { name: 'White Samba Rice', category: 'pantry-staples', basePrice: 890, tags: ['rice'], image: '/placeholder.svg' },
  { name: 'Ceylon Tea', category: 'beverages', basePrice: 950, tags: ['tea'], image: '/placeholder.svg' },
  { name: 'Cashew Nuts', category: 'snacks', basePrice: 1190, tags: ['nuts'], image: '/placeholder.svg' },
  { name: 'Bread (Wholemeal Loaf)', category: 'bakery', basePrice: 240, tags: ['bakery'], image: '/placeholder.svg' },
];

function slugify(input: string) {
  return input.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-');
}

export async function seedDatabase() {
  console.log('Starting Prisma database seeding...');

  const supplier = await prisma.supplier.upsert({
    where: { email: 'seed@freshpick.lk' },
    update: {},
    create: {
      name: 'Seed Supplier',
      contactName: 'Seed Admin',
      email: 'seed@freshpick.lk',
      phone: '+94112233445',
      city: 'Colombo',
      state: 'Western',
      country: 'LK',
      paymentTerms: 'net_30',
      status: 'active',
    },
  });

  const categories = [];
  for (const category of categoriesData) {
    categories.push(await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    }));
  }
  const categoryBySlug = new Map(categories.map((c) => [c.slug, c.id]));

  let products = 0;
  for (const item of baseCatalog) {
    const sku = `SKU-${slugify(item.name).toUpperCase()}`;
    await prisma.product.upsert({
      where: { sku },
      update: {
        price: item.basePrice,
        stockQty: 100,
        archived: false,
      },
      create: {
        name: `${item.name} (Standard)`,
        sku,
        slug: `${slugify(item.name)}-standard`,
        description: `${item.name} - locally sourced.`,
        price: item.basePrice,
        costPrice: Math.floor(item.basePrice * 0.8),
        categoryId: categoryBySlug.get(item.category),
        supplierId: supplier.id,
        stockQty: 100,
        minStockLevel: 5,
        image: item.image,
        images: [item.image],
        tags: item.tags,
        attributes: {},
        archived: false,
      },
    });
    products++;
  }

  console.log('Database seeding completed successfully.');
  return {
    success: true,
    message: 'Database seeded successfully',
    data: { categories: categories.length, products },
  };
}
