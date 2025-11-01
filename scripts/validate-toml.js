/**
 * Validate netlify.toml syntax
 */
const fs = require('fs');
const path = require('path');
const toml = require('@iarna/toml');

const tomlPath = path.join(process.cwd(), 'netlify.toml');

console.log('🔍 Validating netlify.toml...\n');

try {
  const tomlContent = fs.readFileSync(tomlPath, 'utf-8');
  const parsed = toml.parse(tomlContent);
  
  console.log('✅ netlify.toml is valid TOML!\n');
  console.log('📋 Parsed configuration:');
  console.log(JSON.stringify(parsed, null, 2));
  console.log('\n✨ File is ready for Netlify deployment!');
  process.exit(0);
} catch (error) {
  console.error('❌ netlify.toml has syntax errors:\n');
  console.error(error.message);
  console.error('\n🔧 Please fix the TOML syntax before deploying.');
  process.exit(1);
}
