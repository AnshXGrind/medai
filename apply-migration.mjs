import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in environment variables');
  process.exit(1);
}

console.log('🔧 Connecting to Supabase...');
console.log(`📍 URL: ${supabaseUrl}`);

const supabase = createClient(supabaseUrl, supabaseKey);

// Read migration SQL
const migrationPath = join(__dirname, 'supabase', 'migrations', '20251103_health_id_multi_factor_verification.sql');
const migrationSql = readFileSync(migrationPath, 'utf-8');

console.log(`📄 Migration file loaded (${migrationSql.length} characters)`);
console.log('\n⚠️  NOTE: The anon key cannot execute DDL statements.');
console.log('    You need to use the service_role key or run this in Supabase SQL Editor.\n');

// Split the SQL into individual statements
const statements = migrationSql
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0 && !s.startsWith('--'));

console.log(`Found ${statements.length} SQL statements to execute\n`);

// Try to execute (this will likely fail with anon key, but worth trying)
async function executeMigration() {
  console.log('🚀 Attempting to apply migration...\n');
  
  try {
    // Check if we can at least connect
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Connection test failed:', testError.message);
      showManualInstructions();
      return;
    }
    
    console.log('✅ Connection successful!');
    console.log('\n⚠️  However, DDL operations require admin access.');
    showManualInstructions();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    showManualInstructions();
  }
}

function showManualInstructions() {
  console.log('\n' + '='.repeat(60));
  console.log('📋 MANUAL MIGRATION STEPS:');
  console.log('='.repeat(60));
  console.log('\n1. Go to: https://app.supabase.com/project/tdfkrllvxlrukdzsiwjd/editor');
  console.log('2. Click "SQL Editor" in left sidebar');
  console.log('3. Click "New Query"');
  console.log('4. Copy the contents of:');
  console.log('   supabase/migrations/20251103_health_id_multi_factor_verification.sql');
  console.log('5. Paste into SQL Editor');
  console.log('6. Click "Run" (or Ctrl+Enter)');
  console.log('7. Wait for "Success" message');
  console.log('\n✅ After success:');
  console.log('   - Open http://localhost:8081/env-check.html');
  console.log('   - Click "Test Sign Up"');
  console.log('   - Sign up should work!\n');
}

executeMigration();
