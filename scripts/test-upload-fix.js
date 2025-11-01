/**
 * Test script to verify Excel upload functionality
 * Run with: node scripts/test-upload-fix.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Excel Upload Configuration...\n');

let errors = 0;
let warnings = 0;

// Check 1: Verify uploads directory exists
console.log('1️⃣ Checking uploads directory structure...');
const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'supplier-uploads');
if (fs.existsSync(uploadsDir)) {
  console.log('   ✅ Directory exists:', uploadsDir);
  
  // Check if writable
  try {
    fs.accessSync(uploadsDir, fs.constants.W_OK);
    console.log('   ✅ Directory is writable');
  } catch (err) {
    console.error('   ❌ Directory is NOT writable:', err.message);
    errors++;
  }
} else {
  console.error('   ❌ Directory does not exist:', uploadsDir);
  console.log('   💡 Run: npm run build (this will create it)');
  errors++;
}

// Check 2: Verify init script exists
console.log('\n2️⃣ Checking initialization script...');
const initScript = path.join(process.cwd(), 'scripts', 'init-uploads.js');
if (fs.existsSync(initScript)) {
  console.log('   ✅ Init script exists');
} else {
  console.error('   ❌ Init script missing:', initScript);
  errors++;
}

// Check 3: Verify package.json has updated scripts
console.log('\n3️⃣ Checking package.json scripts...');
const packageJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));
if (packageJson.scripts.build && packageJson.scripts.build.includes('init-uploads')) {
  console.log('   ✅ Build script includes init-uploads');
} else {
  console.warn('   ⚠️  Build script may not initialize uploads');
  warnings++;
}
if (packageJson.scripts.start && packageJson.scripts.start.includes('init-uploads')) {
  console.log('   ✅ Start script includes init-uploads');
} else {
  console.warn('   ⚠️  Start script may not initialize uploads');
  warnings++;
}

// Check 4: Verify API route has proper configuration
console.log('\n4️⃣ Checking API route configuration...');
const apiRoute = path.join(process.cwd(), 'app', 'api', 'suppliers', 'upload', 'route.ts');
if (fs.existsSync(apiRoute)) {
  const routeContent = fs.readFileSync(apiRoute, 'utf8');
  
  if (routeContent.includes('maxDuration')) {
    console.log('   ✅ maxDuration configured');
  } else {
    console.warn('   ⚠️  maxDuration not found');
    warnings++;
  }
  
  if (routeContent.includes('force-dynamic')) {
    console.log('   ✅ Dynamic route configured');
  } else {
    console.warn('   ⚠️  Dynamic configuration not found');
    warnings++;
  }
  
  if (routeContent.includes('fs.promises.access')) {
    console.log('   ✅ Directory access check present');
  } else {
    console.warn('   ⚠️  Directory access check not found');
    warnings++;
  }
} else {
  console.error('   ❌ API route file not found:', apiRoute);
  errors++;
}

// Check 5: Verify Dockerfile has proper setup
console.log('\n5️⃣ Checking Dockerfile configuration...');
const dockerfile = path.join(process.cwd(), 'Dockerfile');
if (fs.existsSync(dockerfile)) {
  const dockerContent = fs.readFileSync(dockerfile, 'utf8');
  
  if (dockerContent.includes('mkdir -p /app/public/uploads')) {
    console.log('   ✅ Dockerfile creates uploads directory');
  } else {
    console.warn('   ⚠️  Dockerfile may not create uploads directory');
    warnings++;
  }
  
  if (dockerContent.includes('chown -R nextjs:nodejs')) {
    console.log('   ✅ Dockerfile sets proper ownership');
  } else {
    console.warn('   ⚠️  Dockerfile may not set proper ownership');
    warnings++;
  }
} else {
  console.warn('   ⚠️  Dockerfile not found (may not be using Docker)');
}

// Check 6: Verify dependencies
console.log('\n6️⃣ Checking required dependencies...');
const requiredDeps = ['xlsx', 'papaparse'];
const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
requiredDeps.forEach(dep => {
  if (deps[dep]) {
    console.log(`   ✅ ${dep} installed (${deps[dep]})`);
  } else {
    console.error(`   ❌ ${dep} not installed`);
    errors++;
  }
});

// Summary
console.log('\n' + '='.repeat(50));
if (errors === 0 && warnings === 0) {
  console.log('✨ All checks passed! Excel upload should work correctly.');
  console.log('\n📝 Next steps:');
  console.log('   1. Commit and push changes');
  console.log('   2. Deploy to production');
  console.log('   3. Test upload functionality');
} else {
  console.log(`⚠️  Found ${errors} error(s) and ${warnings} warning(s)`);
  if (errors > 0) {
    console.log('\n❌ Please fix the errors before deploying.');
    process.exit(1);
  } else {
    console.log('\n⚠️  Warnings may indicate potential issues.');
    console.log('   Review them before deploying.');
  }
}
console.log('='.repeat(50));
