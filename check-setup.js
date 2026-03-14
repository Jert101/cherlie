// Quick setup diagnostic script
// Run with: node check-setup.js

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking setup...\n');

// Check .env.local
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  console.log('✅ .env.local file exists');
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  if (envContent.includes('your_supabase_project_url_here')) {
    console.log('⚠️  WARNING: .env.local still has placeholder values!');
    console.log('   Please update with your actual Supabase credentials.\n');
  } else if (envContent.includes('NEXT_PUBLIC_SUPABASE_URL') && envContent.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY')) {
    console.log('✅ .env.local has environment variables defined');
  }
} else {
  console.log('❌ .env.local file NOT found');
  console.log('   Create it with your Supabase credentials.\n');
}

// Check package.json
if (fs.existsSync('package.json')) {
  console.log('✅ package.json exists');
} else {
  console.log('❌ package.json NOT found');
}

// Check node_modules
if (fs.existsSync('node_modules')) {
  console.log('✅ node_modules exists');
} else {
  console.log('❌ node_modules NOT found - run: npm install');
}

// Check schema.sql
if (fs.existsSync('supabase/schema.sql')) {
  console.log('✅ supabase/schema.sql exists');
} else {
  console.log('❌ supabase/schema.sql NOT found');
}

console.log('\n📝 Next steps:');
console.log('1. Update .env.local with your Supabase credentials');
console.log('2. Run the schema.sql in Supabase SQL Editor');
console.log('3. Restart dev server: npm run dev');
