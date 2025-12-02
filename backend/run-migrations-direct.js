#!/usr/bin/env node

/**
 * Direct migration execution script for Supabase
 * This script will attempt to execute the SQL migrations directly
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: SUPABASE_URL y SUPABASE_ANON_KEY son requeridos en .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function executeMigration(filename, sql) {
  console.log(`\n▶️  Ejecutando: ${filename}`);
  console.log('─'.repeat(70));
  
  try {
    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    for (const statement of statements) {
      if (statement.toLowerCase().includes('create table') || 
          statement.toLowerCase().includes('insert into') ||
          statement.toLowerCase().includes('create index') ||
          statement.toLowerCase().includes('create trigger') ||
          statement.toLowerCase().includes('create or replace function')) {
        
        // Use RPC to execute raw SQL (requires service role key or proper permissions)
        const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });
        
        if (error) {
          // If exec_sql doesn't exist, we need to use a different approach
          if (error.code === '42883') {
            console.log('⚠️  RPC function exec_sql no disponible.');
            console.log('   Las migraciones deben ejecutarse manualmente en Supabase SQL Editor.');
            return false;
          }
          throw error;
        }
      }
    }
    
    console.log(`✅ ${filename} completada`);
    return true;
  } catch (error) {
    console.error(`❌ Error en ${filename}:`, error.message);
    if (error.hint) console.error(`   Hint: ${error.hint}`);
    return false;
  }
}

async function run() {
  console.log('🚀 Intentando ejecutar migraciones en Supabase...\n');
  
  const migrationsDir = path.join(__dirname, 'migrations', 'supabase');
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();
  
  console.log(`📋 Encontradas ${files.length} migraciones\n`);
  
  let canExecute = true;
  
  for (const file of files) {
    const sqlPath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    if (canExecute) {
      const success = await executeMigration(file, sql);
      if (!success) {
        canExecute = false;
        console.log('\n══════════════════════════════════════════════════════════════');
        console.log('Las migraciones deben ejecutarse manualmente en Supabase:');
        console.log('══════════════════════════════════════════════════════════════\n');
      }
    }
    
    if (!canExecute) {
      console.log(`\n📄 Contenido de ${file}:`);
      console.log('─'.repeat(70));
      console.log(sql);
      console.log('─'.repeat(70));
    }
  }
  
  if (!canExecute) {
    console.log('\n\n📝 Para ejecutar las migraciones:');
    console.log('1. Ve a https://supabase.com/dashboard/project/bqgfyxasmyrkiqucospz');
    console.log('2. Haz clic en "SQL Editor"');
    console.log('3. Crea una nueva query');
    console.log('4. Copia y pega el contenido mostrado arriba');
    console.log('5. Haz clic en "Run"\n');
  } else {
    console.log('\n🎉 Todas las migraciones ejecutadas exitosamente!');
  }
}

run().catch(error => {
  console.error('\n❌ Error:', error);
  process.exit(1);
});
