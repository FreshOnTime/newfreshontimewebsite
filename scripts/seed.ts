#!/usr/bin/env node

import { seedDatabase } from '../lib/seed';
import { config } from 'dotenv';

// Load environment variables
config();

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
