/**
 * Initialize upload directories for production deployment
 * This script ensures all necessary upload directories exist with proper permissions
 */

const fs = require('fs');
const path = require('path');

const uploadsDirectories = [
  'public/uploads/supplier-uploads',
  'public/uploads/products',
  'public/uploads',
];

console.log('🚀 Initializing upload directories...');

uploadsDirectories.forEach((dir) => {
  const fullPath = path.join(process.cwd(), dir);
  
  try {
    // Create directory if it doesn't exist
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`✅ Created: ${dir}`);
    } else {
      console.log(`✓ Exists: ${dir}`);
    }
    
    // Verify directory is writable
    fs.accessSync(fullPath, fs.constants.W_OK);
    console.log(`✓ Writable: ${dir}`);
    
  } catch (error) {
    console.error(`❌ Error with ${dir}:`, error.message);
    process.exit(1);
  }
});

console.log('✨ Upload directories initialized successfully!');
