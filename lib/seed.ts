import connectDB from './database';
import EnhancedProduct from './models/EnhancedProduct';
import Category from './models/Category';
import Supplier from './models/Supplier';
import mongoose from 'mongoose';
// Only seed categories and products for now

// Categories
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

// (Suppliers removed - not seeding suppliers in this run)

// Products (link category/supplier at insert time) — programmatically generate ~100 Sri Lankan products/variants
const baseCatalog = [
  { name: 'Organic Bananas', category: 'fresh-produce', basePrice: 280, tags: ['organic','fruit'], image: '/banana.avif' },
  { name: 'Carrots', category: 'fresh-produce', basePrice: 200, tags: ['vegetable'], image: '/placeholder.svg' },
  { name: 'Spinach', category: 'fresh-produce', basePrice: 120, tags: ['leafy greens'], image: '/placeholder.svg' },
  { name: 'Milk', category: 'dairy-eggs', basePrice: 320, tags: ['dairy'], image: '/placeholder.svg' },
  { name: 'Eggs (10)', category: 'dairy-eggs', basePrice: 700, tags: ['eggs'], image: '/placeholder.svg' },
  { name: 'Chicken Breast', category: 'meat-seafood', basePrice: 1250, tags: ['meat'], image: '/placeholder.svg' },
  { name: 'Chicken Leg', category: 'meat-seafood', basePrice: 980, tags: ['meat'], image: '/placeholder.svg' },
  { name: 'White Samba Rice', category: 'pantry-staples', basePrice: 890, tags: ['rice'], image: '/placeholder.svg' },
  { name: 'Basmati Rice', category: 'pantry-staples', basePrice: 1750, tags: ['rice'], image: '/placeholder.svg' },
  { name: 'Ceylon Tea', category: 'beverages', basePrice: 950, tags: ['tea'], image: '/placeholder.svg' },
  { name: 'Coconut Oil', category: 'pantry-staples', basePrice: 1580, tags: ['oil'], image: '/placeholder.svg' },
  { name: 'Kithul Treacle', category: 'pantry-staples', basePrice: 650, tags: ['sweetener'], image: '/placeholder.svg' },
  { name: 'Mango', category: 'fresh-produce', basePrice: 180, tags: ['fruit'], image: '/placeholder.svg' },
  { name: 'Plain Yoghurt', category: 'dairy-eggs', basePrice: 420, tags: ['dairy'], image: '/placeholder.svg' },
  { name: 'Sunquick Orange', category: 'beverages', basePrice: 980, tags: ['beverages'], image: '/placeholder.svg' },
  { name: 'Cashew Nuts', category: 'snacks', basePrice: 1190, tags: ['nuts'], image: '/placeholder.svg' },
  { name: 'Sardines (Tin)', category: 'pantry-staples', basePrice: 220, tags: ['fish','canned'], image: '/placeholder.svg' },
  { name: 'Tuna (Tin)', category: 'pantry-staples', basePrice: 350, tags: ['fish','canned'], image: '/placeholder.svg' },
  { name: 'Instant Noodles', category: 'pantry-staples', basePrice: 85, tags: ['noodles','instant'], image: '/placeholder.svg' },
  { name: 'Sugar (1 kg)', category: 'pantry-staples', basePrice: 285, tags: ['staple'], image: '/placeholder.svg' },
  { name: 'Red Dhal (1 kg)', category: 'pantry-staples', basePrice: 640, tags: ['pulses'], image: '/placeholder.svg' },
  { name: 'Coconut Milk (400 ml)', category: 'pantry-staples', basePrice: 220, tags: ['cooking'], image: '/placeholder.svg' },
  { name: 'Salt (1 kg)', category: 'pantry-staples', basePrice: 120, tags: ['staple'], image: '/placeholder.svg' },
  { name: 'Black Pepper (50 g)', category: 'pantry-staples', basePrice: 320, tags: ['spices'], image: '/placeholder.svg' },
  { name: 'Cinnamon Sticks (50 g)', category: 'pantry-staples', basePrice: 420, tags: ['spices'], image: '/placeholder.svg' },
  { name: 'Cardamom (25 g)', category: 'pantry-staples', basePrice: 480, tags: ['spices'], image: '/placeholder.svg' },
  { name: 'Cooking Oil (Sunflower 1 L)', category: 'pantry-staples', basePrice: 1650, tags: ['oil'], image: '/placeholder.svg' },
  { name: 'Tomatoes', category: 'fresh-produce', basePrice: 260, tags: ['vegetable'], image: '/placeholder.svg' },
  { name: 'Onions', category: 'fresh-produce', basePrice: 180, tags: ['vegetable'], image: '/placeholder.svg' },
  { name: 'Potatoes', category: 'fresh-produce', basePrice: 160, tags: ['vegetable'], image: '/placeholder.svg' },
  { name: 'Green Chillies (250 g)', category: 'fresh-produce', basePrice: 120, tags: ['spice'], image: '/placeholder.svg' },
  { name: 'Garlic (200 g)', category: 'fresh-produce', basePrice: 240, tags: ['spice'], image: '/placeholder.svg' },
  { name: 'Ginger (200 g)', category: 'fresh-produce', basePrice: 220, tags: ['spice'], image: '/placeholder.svg' },
  { name: 'Pineapple', category: 'fresh-produce', basePrice: 380, tags: ['fruit'], image: '/placeholder.svg' },
  { name: 'Papaya', category: 'fresh-produce', basePrice: 220, tags: ['fruit'], image: '/placeholder.svg' },
  { name: 'Curry Powder (200 g)', category: 'pantry-staples', basePrice: 320, tags: ['spices'], image: '/placeholder.svg' },
  { name: 'Sambol (Pol Sambol mix)', category: 'pantry-staples', basePrice: 150, tags: ['condiment'], image: '/placeholder.svg' },
  { name: 'Hopper Flour (500 g)', category: 'bakery', basePrice: 210, tags: ['baking'], image: '/placeholder.svg' },
  { name: 'Bread (Wholemeal Loaf)', category: 'bakery', basePrice: 240, tags: ['bakery'], image: '/placeholder.svg' },
  { name: 'Butter (200 g)', category: 'pantry-staples', basePrice: 450, tags: ['dairy'], image: '/placeholder.svg' },
  { name: 'Cheese (200 g)', category: 'pantry-staples', basePrice: 760, tags: ['dairy'], image: '/placeholder.svg' },
];

// Generate variants to reach ~100 items
function slugify(input: string) {
  return input
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

const variants = ['500 g', '1 kg', '2 kg', '5 kg', '250 g', '1 L', '750 ml', 'per piece'];
type SeedProduct = {
  name: string;
  slugHint: string;
  categorySlug: string;
  description: string;
  price: number;
  stockQty: number;
  images: string[];
  tags?: string[];
};

const productsSeed: SeedProduct[] = [];
for (const item of baseCatalog) {
  // push base size
  const baseName = item.name;
  const basePrice = item.basePrice;
  const baseEntry = {
    name: `${baseName} (Standard)`,
    slugHint: `${slugify(baseName)}-standard`,
    categorySlug: item.category,
    description: `${baseName} - locally sourced.`,
    price: Math.round(basePrice),
    stockQty: Math.floor(50 + Math.random() * 150),
    images: [item.image || '/placeholder.svg'],
    tags: item.tags,
  };
  productsSeed.push(baseEntry);

  // add variants
  for (const v of variants) {
    if (productsSeed.length >= 100) break;
    const multiplier = v.includes('kg') ? (v === '5 kg' ? 5 : v === '2 kg' ? 2 : 1) : v.includes('500') || v.includes('250') ? 0.5 : v.includes('per piece') ? 0.4 : 1;
    const price = Math.max(50, Math.round(basePrice * multiplier));
    const name = `${baseName} (${v})`;
    productsSeed.push({
      name,
      slugHint: `${slugify(baseName)}-${slugify(v)}`,
      categorySlug: item.category,
      description: `${name} - quality checked and ready to ship.`,
      price,
      stockQty: Math.floor(20 + Math.random() * 180),
      images: [item.image || '/placeholder.svg'],
      tags: item.tags,
    });
  // increment not used elsewhere
  }
  if (productsSeed.length >= 100) break;
}


// (Customers/Users/Orders removed - only categories & products will be seeded)

export async function seedDatabase() {
  await connectDB();
  console.log('🌱 Starting database seeding...');

  // Clear collections we will re-seed (categories & products)
  console.log('🧹 Clearing existing categories and products...');
  await Promise.all([
    EnhancedProduct.deleteMany({}),
    Category.deleteMany({}),
  ]);

  // Categories
  console.log('📂 Seeding categories...');
  const categoryDocs = await Category.insertMany(categoriesData);
  const categoryBySlug = new Map(categoryDocs.map((c) => [c.slug, c._id]));
  console.log(`✅ Seeded ${categoryDocs.length} categories`);

  // Ensure at least one supplier exists because EnhancedProduct requires supplierId
  console.log('🏭 Ensuring default supplier exists...');
  let defaultSupplier = null;
  try {
    defaultSupplier = await Supplier.findOne({ name: 'Seed Supplier' }).exec();
    if (!defaultSupplier) {
      defaultSupplier = await Supplier.create({
        name: 'Seed Supplier',
        contactName: 'Seed Admin',
        email: 'seed@freshpick.lk',
        phone: '+94112233445',
        address: { street: 'Seed Street', city: 'Colombo', state: 'Western', zipCode: '00000', country: 'Sri Lanka' },
        paymentTerms: 'net-0',
        status: 'active',
      });
    }
  } catch (err: unknown) {
    const maybeErr = err as { message?: unknown } | undefined;
    const msg = maybeErr && typeof maybeErr.message === 'string' ? maybeErr.message : String(err);
    console.warn('Could not create or find Supplier - continuing without supplier:', msg);
    defaultSupplier = null;
  }

  // If we couldn't obtain a Supplier via the model, try inserting directly into the collection
  let supplierIdForProducts = defaultSupplier?._id;
  if (!supplierIdForProducts) {
    try {
      const coll = mongoose.connection.collection('suppliers');
      const res = await coll.insertOne({
        name: 'Seed Supplier',
        contactName: 'Seed Admin',
        email: 'seed@freshpick.lk',
        phone: '+94112233445',
        address: { street: 'Seed Street', city: 'Colombo', state: 'Western', zipCode: '00000', country: 'Sri Lanka' },
        paymentTerms: 'net-0',
        status: 'active',
        totalProducts: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      supplierIdForProducts = res.insertedId;
      console.log('ℹ️ Inserted supplier directly into collection with id', supplierIdForProducts?.toString?.());
    } catch {
      // final fallback: use a generated ObjectId to satisfy required field
      supplierIdForProducts = new mongoose.Types.ObjectId();
      console.warn('⚠️ Could not insert supplier into collection; using generated ObjectId for supplierId', supplierIdForProducts.toString());
    }
  }

  // Products
  console.log('🛍️ Seeding products...');
  const productDocs = await EnhancedProduct.insertMany(
    productsSeed.map((p) => {
      const sku = `SKU-${p.slugHint.toUpperCase().replace(/[^A-Z0-9]+/g, '-')}`;
      const slug = p.slugHint.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
      return {
        name: p.name,
        sku,
        slug,
        description: p.description,
        price: p.price,
        costPrice: Math.floor(p.price * 0.8),
        categoryId: categoryBySlug.get(p.categorySlug),
        supplierId: supplierIdForProducts,
        stockQty: p.stockQty,
        minStockLevel: 5,
        images: p.images,
        tags: p.tags ?? [],
        attributes: {},
        archived: false,
      };
    })
  );
  console.log(`✅ Seeded ${productDocs.length} products`);

  console.log('🎉 Database seeding completed successfully!');
  console.log('📊 Summary:');
  console.log(`   • Categories: ${categoryDocs.length}`);
  console.log(`   • Products: ${productDocs.length}`);

  return {
    success: true,
    message: 'Database seeded successfully',
    data: {
      categories: categoryDocs.length,
      products: productDocs.length,
    },
  };
}
