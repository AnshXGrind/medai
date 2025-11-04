import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
const SUPABASE_URL = 'https://asarylspdxgosxzrqpue.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ Error: SUPABASE_SERVICE_KEY or VITE_SUPABASE_ANON_KEY not found');
  console.error('Please set one of these environment variables');
  process.exit(1);
}

console.log('🔄 Connecting to Supabase...');
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Read the SQL file
const sqlPath = join(__dirname, 'supabase', 'migrations', 'combined_all_migrations.sql');
console.log(`📖 Reading SQL file: ${sqlPath}`);

let sql;
try {
  sql = readFileSync(sqlPath, 'utf8');
  console.log(`✅ Loaded ${sql.split('\n').length} lines of SQL`);
} catch (error) {
  console.error('❌ Error reading SQL file:', error.message);
  process.exit(1);
}

console.log('\n🚀 Applying migrations...');
console.log('This may take 10-15 seconds...\n');

try {
  // Execute the SQL
  const { data, error } = await supabase.rpc('exec_sql', { sql_string: sql });
  
  if (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
  
  console.log('✅ SUCCESS! All migrations applied!');
  console.log('\n📊 Verifying tables...');
  
  // Verify key tables exist
  const { data: tables, error: tablesError } = await supabase
    .from('profiles')
    .select('id')
    .limit(1);
  
  if (!tablesError) {
    console.log('✅ profiles table exists');
  }
  
  console.log('\n🎉 Database setup complete!');
  console.log('You can now test authentication at http://localhost:8080');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error('\n⚠️  The Supabase client cannot execute raw SQL directly.');
  console.error('You need to manually run the SQL in the Supabase dashboard.');
  console.error('\n📋 Please follow these steps:');
  console.error('1. Go to: https://supabase.com/dashboard/project/asarylspdxgosxzrqpue/sql/new');
  console.error('2. Open: supabase\\migrations\\combined_all_migrations.sql');
  console.error('3. Copy all content (Ctrl+A, Ctrl+C)');
  console.error('4. Paste in SQL editor (Ctrl+V)');
  console.error('5. Click RUN');
}
