import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔍 Checking if migration has been applied...\n');

async function checkMigration() {
  try {
    // Try to select the new column - if it exists, migration is applied
    const { data, error } = await supabase
      .from('profiles')
      .select('health_id_hash, health_id_last_four')
      .limit(1);
    
    if (error) {
      if (error.message.includes('health_id_hash') || error.message.includes('column')) {
        console.log('❌ Migration NOT applied yet');
        console.log('   Column "health_id_hash" does not exist\n');
        console.log('📝 Please follow the steps at:');
        console.log('   http://localhost:8081/apply-migration.html\n');
        return false;
      } else {
        console.error('❌ Unexpected error:', error.message);
        return false;
      }
    }
    
    console.log('✅ Migration HAS BEEN APPLIED!');
    console.log('   Column "health_id_hash" exists in profiles table\n');
    
    // Check for other columns too
    console.log('🔍 Checking other new columns...');
    const { data: allColumns, error: error2 } = await supabase
      .from('profiles')
      .select('health_id_hash, health_id_last_four, pan_hash, voter_id_hash, dl_hash, passport_hash')
      .limit(1);
    
    if (!error2) {
      console.log('✅ All new columns exist:');
      console.log('   - health_id_hash ✓');
      console.log('   - health_id_last_four ✓');
      console.log('   - pan_hash ✓');
      console.log('   - voter_id_hash ✓');
      console.log('   - dl_hash ✓');
      console.log('   - passport_hash ✓\n');
    }
    
    console.log('🎉 SUCCESS! You can now test sign up/sign in!\n');
    console.log('📝 Next steps:');
    console.log('   1. Go to: http://localhost:8081');
    console.log('   2. Try signing up with:');
    console.log('      - Email: test@example.com');
    console.log('      - Password: TestPass123!');
    console.log('      - Full Name: Test User');
    console.log('      - Health ID: 12345678901234');
    console.log('   3. Sign up should work now! ✨\n');
    
    return true;
    
  } catch (error) {
    console.error('❌ Error checking migration:', error.message);
    return false;
  }
}

checkMigration();
