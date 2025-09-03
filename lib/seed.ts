import connectDB from './database';
import EnhancedProduct from './models/EnhancedProduct';
import Category from './models/Category';
import Order from './models/Order';
import User from './models/User';
import Supplier from './models/Supplier';
import Customer from './models/Customer';

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

// Suppliers
const suppliersData = [
  {
    name: 'Fresh Farms Ltd.',
    contactName: 'Lakshan Perera',
    email: 'suppliers+freshfarms@example.com',
    phone: '+94112345678',
    address: { street: '10 Farm Rd', city: 'Colombo', state: 'Western', zipCode: '00100', country: 'Sri Lanka' },
    paymentTerms: 'net-30',
    notes: 'Primary produce supplier',
    status: 'active' as const,
  },
  {
    name: 'DairyBest Co.',
    contactName: 'Nimali Jayasuriya',
    email: 'suppliers+dairybest@example.com',
    phone: '+94119876543',
    address: { street: '25 Milk Ave', city: 'Kandy', state: 'Central', zipCode: '20000', country: 'Sri Lanka' },
    paymentTerms: 'net-30',
    status: 'active' as const,
  },
];

// Products (link category/supplier at insert time)
const productsSeed = [
  { name: 'Organic Bananas', slugHint: 'organic-bananas', categorySlug: 'fresh-produce', description: 'Fresh organic bananas', price: 250, stockQty: 100, images: ['/banana.avif'], tags: ['organic', 'fresh', 'healthy'] },
  { name: 'Fresh Carrots', slugHint: 'fresh-carrots', categorySlug: 'fresh-produce', description: 'Crunchy and sweet fresh carrots', price: 180, stockQty: 80, images: ['/placeholder.svg'], tags: ['fresh', 'vitamin A'] },
  { name: 'Organic Spinach', slugHint: 'organic-spinach', categorySlug: 'fresh-produce', description: 'Fresh organic spinach leaves', price: 320, stockQty: 50, images: ['/placeholder.svg'], tags: ['organic', 'leafy greens', 'iron'] },
  { name: 'Fresh Milk', slugHint: 'fresh-milk', categorySlug: 'dairy-eggs', description: 'Farm fresh whole milk', price: 450, stockQty: 60, images: ['/placeholder.svg'], tags: ['dairy', 'calcium', 'protein'] },
  { name: 'Farm Eggs', slugHint: 'farm-eggs', categorySlug: 'dairy-eggs', description: 'Fresh farm eggs', price: 600, stockQty: 40, images: ['/placeholder.svg'], tags: ['eggs', 'protein', 'free-range'] },
  { name: 'Fresh Chicken Breast', slugHint: 'chicken-breast', categorySlug: 'meat-seafood', description: 'Premium boneless chicken breast', price: 1200, stockQty: 25, images: ['/placeholder.svg'], tags: ['chicken', 'protein', 'lean meat'] },
  { name: 'Basmati Rice', slugHint: 'basmati-rice', categorySlug: 'pantry-staples', description: 'Premium basmati rice', price: 850, stockQty: 100, images: ['/placeholder.svg'], tags: ['rice', 'staple'] },
  { name: 'Fresh Orange Juice', slugHint: 'orange-juice', categorySlug: 'beverages', description: '100% pure fresh orange juice', price: 380, stockQty: 30, images: ['/placeholder.svg'], tags: ['juice', 'vitamin C', 'no sugar'] },
];

// Customers (for orders)
const customersData = [
  {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+94771234567',
    address: { street: '123 Main Street', city: 'Colombo', state: 'Western', zipCode: '00100', country: 'Sri Lanka' },
  },
  {
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '+94777654321',
    address: { street: '456 Oak Avenue', city: 'Kandy', state: 'Central', zipCode: '20000', country: 'Sri Lanka' },
  },
];

// Users
const usersData = [
  {
    userId: 'user-001',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phoneNumber: '+94771234567',
    role: 'customer' as const,
    isEmailVerified: true,
    isPhoneVerified: true,
    registrationAddress: { street: '123 Main Street', city: 'Colombo', state: 'Western', postalCode: '00100', country: 'Sri Lanka' },
    addresses: [{ street: '123 Main Street', city: 'Colombo', state: 'Western', postalCode: '00100', country: 'Sri Lanka', isDefault: true }],
  },
  {
    userId: 'user-002',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    phoneNumber: '+94777654321',
    role: 'customer' as const,
    isEmailVerified: true,
    isPhoneVerified: true,
    registrationAddress: { street: '456 Oak Avenue', city: 'Kandy', state: 'Central', postalCode: '20000', country: 'Sri Lanka' },
    addresses: [{ street: '456 Oak Avenue', city: 'Kandy', state: 'Central', postalCode: '20000', country: 'Sri Lanka', isDefault: true }],
  },
  {
    userId: 'admin-001',
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@freshpick.lk',
    phoneNumber: '+94701234567',
    role: 'admin' as const,
    isEmailVerified: true,
    isPhoneVerified: true,
    registrationAddress: { street: '789 Admin Street', city: 'Colombo', state: 'Western', postalCode: '00200', country: 'Sri Lanka' },
    addresses: [{ street: '789 Admin Street', city: 'Colombo', state: 'Western', postalCode: '00200', country: 'Sri Lanka', isDefault: true }],
  },
];

export async function seedDatabase() {
  await connectDB();
  console.log('🌱 Starting database seeding...');

  // Clear in dependency order
  console.log('🧹 Clearing existing data...');
  await Promise.all([
    Order.deleteMany({}),
    EnhancedProduct.deleteMany({}),
    Category.deleteMany({}),
    Supplier.deleteMany({}),
    Customer.deleteMany({}),
    User.deleteMany({}),
  ]);

  // Categories
  console.log('📂 Seeding categories...');
  const categoryDocs = await Category.insertMany(categoriesData);
  const categoryBySlug = new Map(categoryDocs.map((c) => [c.slug, c._id]));
  console.log(`✅ Seeded ${categoryDocs.length} categories`);

  // Suppliers
  console.log('🏭 Seeding suppliers...');
  const supplierDocs = await Supplier.insertMany(suppliersData);
  const defaultSupplierId = supplierDocs[0]?._id;
  console.log(`✅ Seeded ${supplierDocs.length} suppliers`);

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
        supplierId: defaultSupplierId,
        stockQty: p.stockQty,
        minStockLevel: 5,
        images: p.images,
        tags: p.tags ?? [],
        attributes: {},
        archived: false,
      };
    })
  );
  const productBySlug = new Map(productDocs.map((pd) => [pd.slug, pd]));
  console.log(`✅ Seeded ${productDocs.length} products`);

  // Customers
  console.log('👥 Seeding customers...');
  const customerDocs = await Customer.insertMany(customersData);
  console.log(`✅ Seeded ${customerDocs.length} customers`);

  // Users
  console.log('🔑 Seeding users...');
  await User.insertMany(usersData);
  console.log(`✅ Seeded ${usersData.length} users`);

  // Orders (EnhancedOrder shape)
  console.log('📦 Seeding orders...');
  const john = customerDocs.find((c) => c.email === 'john.doe@example.com')!;
  const jane = customerDocs.find((c) => c.email === 'jane.smith@example.com')!;
  const bananas = productBySlug.get('organic-bananas');
  const milk = productBySlug.get('fresh-milk');
  const spinach = productBySlug.get('organic-spinach');
  const eggs = productBySlug.get('farm-eggs');

  const orderItems1 = [bananas, milk].filter(Boolean).map((p: any) => ({
    productId: p._id, sku: p.sku, name: p.name, qty: p.slug === 'fresh-milk' ? 1 : 2, price: p.price, total: p.price * (p.slug === 'fresh-milk' ? 1 : 2),
  }));
  const subtotal1 = orderItems1.reduce((s, it) => s + it.total, 0);
  const shipping1 = 200;

  const orderItems2 = [spinach, eggs].filter(Boolean).map((p: any) => ({
    productId: p._id, sku: p.sku, name: p.name, qty: p.slug === 'farm-eggs' ? 2 : 1, price: p.price, total: p.price * (p.slug === 'farm-eggs' ? 2 : 1),
  }));
  const subtotal2 = orderItems2.reduce((s, it) => s + it.total, 0);
  const shipping2 = 250;

  await Order.insertMany([
    {
      orderNumber: 'ORD-20240115-0001',
      customerId: john._id,
      items: orderItems1,
      subtotal: subtotal1,
      tax: 0,
      shipping: shipping1,
      discount: 0,
      total: subtotal1 + shipping1,
      status: 'delivered',
      paymentMethod: 'cash',
      paymentStatus: 'paid',
      shippingAddress: {
        name: 'John Doe',
        street: john.address?.street || '123 Main Street',
        city: john.address?.city || 'Colombo',
        state: john.address?.state || 'Western',
        zipCode: john.address?.zipCode || '00100',
        country: john.address?.country || 'Sri Lanka',
        phone: john.phone,
      },
      estimatedDelivery: new Date('2024-01-16'),
      actualDelivery: new Date('2024-01-16'),
      notes: 'First sample order',
    },
    {
      orderNumber: 'ORD-20240120-0002',
      customerId: jane._id,
      items: orderItems2,
      subtotal: subtotal2,
      tax: 0,
      shipping: shipping2,
      discount: 0,
      total: subtotal2 + shipping2,
      status: 'pending',
      paymentMethod: 'cash',
      paymentStatus: 'pending',
      shippingAddress: {
        name: 'Jane Smith',
        street: jane.address?.street || '456 Oak Avenue',
        city: jane.address?.city || 'Kandy',
        state: jane.address?.state || 'Central',
        zipCode: jane.address?.zipCode || '20000',
        country: jane.address?.country || 'Sri Lanka',
        phone: jane.phone,
      },
      estimatedDelivery: new Date('2024-01-21'),
      notes: 'Second sample order',
    },
  ]);
  console.log('✅ Seeded 2 orders');

  console.log('🎉 Database seeding completed successfully!');
  console.log('📊 Summary:');
  console.log(`   • Categories: ${categoryDocs.length}`);
  console.log(`   • Suppliers: ${supplierDocs.length}`);
  console.log(`   • Products: ${productDocs.length}`);
  console.log(`   • Customers: ${customerDocs.length}`);
  console.log(`   • Users: ${usersData.length} (including 1 admin)`);
  console.log('   • Orders: 2');

  return {
    success: true,
    message: 'Database seeded successfully',
    data: {
      categories: categoryDocs.length,
      suppliers: supplierDocs.length,
      products: productDocs.length,
      customers: customerDocs.length,
      users: usersData.length,
      orders: 2,
    },
  };
}
