/**
 * Greenfield seed for the Postgres/Supabase database.
 * Run with: npm run db:seed  (after `npm run db:migrate`)
 * Idempotent — safe to re-run; uses upserts on natural keys.
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Password123', 12);

  // --- Users ---
  const admin = await prisma.user.upsert({
    where: { phoneNumber: '+94770000001' },
    update: {},
    create: {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@freshpick.lk',
      phoneNumber: '+94770000001',
      passwordHash,
      role: 'admin',
      isEmailVerified: true,
      addresses: {
        create: [{
          recipientName: 'Admin User',
          streetAddress: '1 Market Street',
          town: 'Colombo',
          city: 'Colombo',
          state: 'Western',
          postalCode: '00100',
          countryCode: 'LK',
          phoneNumber: '+94770000001',
          type: 'Business',
          isRegistration: true,
        }],
      },
    },
  });

  const customer = await prisma.user.upsert({
    where: { phoneNumber: '+94770000002' },
    update: {},
    create: {
      firstName: 'Sample',
      lastName: 'Customer',
      email: 'customer@example.com',
      phoneNumber: '+94770000002',
      passwordHash,
      role: 'customer',
      addresses: {
        create: [{
          recipientName: 'Sample Customer',
          streetAddress: '22 Galle Road',
          town: 'Dehiwala',
          city: 'Dehiwala',
          state: 'Western',
          postalCode: '10350',
          countryCode: 'LK',
          phoneNumber: '+94770000002',
          type: 'Home',
          isRegistration: true,
        }],
      },
    },
  });

  // --- Supplier + supplier user ---
  const supplier = await prisma.supplier.upsert({
    where: { email: 'supplier@example.com' },
    update: {},
    create: {
      name: 'Green Valley Farms',
      contactName: 'Nimal Perera',
      email: 'supplier@example.com',
      phone: '+94770000003',
      city: 'Nuwara Eliya',
      state: 'Central',
      country: 'LK',
      paymentTerms: 'net_30',
      status: 'active',
    },
  });

  await prisma.user.upsert({
    where: { phoneNumber: '+94770000003' },
    update: { supplierId: supplier.id, role: 'supplier' },
    create: {
      firstName: 'Nimal',
      lastName: 'Perera',
      email: 'supplier@example.com',
      phoneNumber: '+94770000003',
      passwordHash,
      role: 'supplier',
      supplierId: supplier.id,
      addresses: {
        create: [{
          recipientName: 'Nimal Perera',
          streetAddress: 'Farm Road',
          town: 'Nuwara Eliya',
          city: 'Nuwara Eliya',
          state: 'Central',
          postalCode: '22200',
          countryCode: 'LK',
          phoneNumber: '+94770000003',
          type: 'Business',
          isRegistration: true,
        }],
      },
    },
  });

  // --- Categories ---
  const vegetables = await prisma.category.upsert({
    where: { slug: 'vegetables' },
    update: {},
    create: { name: 'Vegetables', slug: 'vegetables', sortOrder: 1 },
  });
  const fruits = await prisma.category.upsert({
    where: { slug: 'fruits' },
    update: {},
    create: { name: 'Fruits', slug: 'fruits', sortOrder: 2 },
  });

  // --- Products ---
  const products = [
    { name: 'Organic Carrots (1kg)', sku: 'VEG-CARROT-1KG', slug: 'organic-carrots-1kg', price: 320, costPrice: 180, stockQty: 120, categoryId: vegetables.id },
    { name: 'Fresh Tomatoes (1kg)', sku: 'VEG-TOMATO-1KG', slug: 'fresh-tomatoes-1kg', price: 280, costPrice: 150, stockQty: 4, categoryId: vegetables.id },
    { name: 'Green Apples (1kg)', sku: 'FRT-APPLE-1KG', slug: 'green-apples-1kg', price: 650, costPrice: 400, stockQty: 60, categoryId: fruits.id },
    { name: 'Bananas (1 dozen)', sku: 'FRT-BANANA-12', slug: 'bananas-dozen', price: 240, costPrice: 120, stockQty: 0, categoryId: fruits.id },
  ];
  for (const p of products) {
    await prisma.product.upsert({
      where: { sku: p.sku },
      update: { price: p.price, stockQty: p.stockQty },
      create: { ...p, supplierId: supplier.id, minStockLevel: 5, images: [] },
    });
  }

  // --- Subscription plan ---
  await prisma.subscriptionPlan.upsert({
    where: { slug: 'weekly-essentials' },
    update: {},
    create: {
      name: 'Weekly Essentials Box',
      slug: 'weekly-essentials',
      description: 'A curated weekly box of fresh seasonal produce delivered to your door.',
      shortDescription: 'Fresh seasonal produce, weekly.',
      price: 1800,
      frequency: 'weekly',
      isActive: true,
      isFeatured: true,
      contents: {
        create: [
          { name: 'Mixed Vegetables', quantity: '2kg', category: 'Vegetables' },
          { name: 'Seasonal Fruits', quantity: '1.5kg', category: 'Fruits' },
        ],
      },
    },
  });

  console.log('Seed complete:', { admin: admin.email, customer: customer.email, supplier: supplier.name });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
