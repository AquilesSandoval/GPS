/**
 * SGPTI - Supabase Migration Runner
 * Ejecuta las migraciones de base de datos en Supabase (PostgreSQL)
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Create Supabase client with service role key if available, otherwise anon key
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: SUPABASE_URL y SUPABASE_ANON_KEY (o SUPABASE_SERVICE_KEY) son requeridos en .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runSQL(sql) {
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    // If the RPC function doesn't exist, we need to execute SQL differently
    // For Supabase, we'll need to run migrations through the dashboard or CLI
    // This is a limitation of the Supabase client
    return { data: null, error };
  }
}

async function run() {
  try {
    console.log('🚀 Iniciando migraciones de SGPTI en Supabase...\n');
    
    // Test connection
    const { error: testError } = await supabase.from('migrations').select('count', { count: 'exact', head: true });
    
    const migrationsDir = path.join(__dirname, 'supabase');
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();
    
    console.log(`📋 Encontradas ${files.length} migraciones:\n`);
    
    // Read and display migration files for manual execution
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('IMPORTANTE: Las migraciones deben ejecutarse manualmente en Supabase');
    console.log('═══════════════════════════════════════════════════════════════\n');
    console.log('Sigue estos pasos:\n');
    console.log('1. Ve a tu proyecto en https://supabase.com');
    console.log('2. Navega a SQL Editor');
    console.log('3. Ejecuta cada migración en orden:\n');
    
    for (const file of files) {
      const sqlPath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(sqlPath, 'utf8');
      
      console.log(`\n▶️  ${file}`);
      console.log('─'.repeat(70));
      console.log(sql);
      console.log('─'.repeat(70));
    }
    
    console.log('\n\n📝 Alternativamente, puedes usar la CLI de Supabase:');
    console.log('   npx supabase db push\n');
    
    console.log('💡 O ejecutar directamente con psql si tienes acceso a la BD:');
    console.log('   psql "postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres" < migrations/supabase/001_create_migrations_table.sql\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

run();
