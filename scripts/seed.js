const { seedDatabase } = require('../lib/seed');
require('dotenv').config();

async function runSeed() {
  try {
    console.log('🌱 Starting database seeding process...');
    await seedDatabase();
    console.log('✅ Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

runSeed();
