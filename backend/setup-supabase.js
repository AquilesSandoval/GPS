#!/usr/bin/env node

/**
 * SGPTI - Supabase Setup Script
 * Script interactivo para configurar Supabase y ejecutar migraciones
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

async function checkConnection() {
  console.log('🔍 Verificando conexión a Supabase...\n');
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Error: Variables de entorno no configuradas');
    console.error('   Por favor configura en .env:');
    console.error('   - SUPABASE_URL');
    console.error('   - SUPABASE_ANON_KEY');
    console.error('\n   Obtén estas credenciales en: https://supabase.com → Tu Proyecto → Settings → API\n');
    return false;
  }
  
  console.log('   SUPABASE_URL:', supabaseUrl);
  console.log('   SUPABASE_KEY:', supabaseKey.substring(0, 20) + '...\n');
  
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Intentar una consulta simple
    const { error } = await supabase.from('roles').select('count', { count: 'exact', head: true });
    
    if (error && error.code !== '42P01') { // 42P01 = table doesn't exist (which is OK)
      throw error;
    }
    
    console.log('✅ Conexión a Supabase exitosa\n');
    return true;
  } catch (error) {
    console.error('❌ Error al conectar con Supabase:', error.message);
    return false;
  }
}

async function checkTables() {
  console.log('🔍 Verificando tablas existentes...\n');
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  const tables = ['roles', 'users', 'migrations'];
  const existingTables = [];
  
  for (const table of tables) {
    const { error } = await supabase.from(table).select('count', { count: 'exact', head: true });
    if (!error || error.code !== '42P01') {
      existingTables.push(table);
      console.log(`   ✅ Tabla '${table}' existe`);
    } else {
      console.log(`   ❌ Tabla '${table}' NO existe`);
    }
  }
  
  console.log();
  return existingTables;
}

async function testRoles() {
  console.log('🔍 Verificando roles en la base de datos...\n');
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .order('id');
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      console.log('   ⚠️  No hay roles en la base de datos\n');
      return false;
    }
    
    console.log(`   ✅ Encontrados ${data.length} roles:`);
    data.forEach(role => {
      console.log(`      - ${role.name}: ${role.description}`);
    });
    console.log();
    return true;
  } catch (error) {
    console.error('   ❌ Error al consultar roles:', error.message);
    console.log();
    return false;
  }
}

function showMigrationInstructions() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('📝 INSTRUCCIONES PARA EJECUTAR LAS MIGRACIONES');
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  console.log('Las tablas necesitan ser creadas en Supabase. Tienes 2 opciones:\n');
  
  console.log('OPCIÓN 1: Usar el SQL Editor de Supabase (Recomendado)');
  console.log('─────────────────────────────────────────────────────────────');
  console.log('1. Ve a https://supabase.com y abre tu proyecto');
  console.log('2. Ve a SQL Editor en el menú lateral');
  console.log('3. Crea una nueva query');
  console.log('4. Copia y pega el contenido de cada archivo de migración:');
  console.log('   - backend/migrations/supabase/001_create_migrations_table.sql');
  console.log('   - backend/migrations/supabase/002_create_users_table.sql');
  console.log('5. Ejecuta cada migración presionando "Run"\n');
  
  console.log('OPCIÓN 2: Usar Node.js para mostrar las migraciones');
  console.log('─────────────────────────────────────────────────────────────');
  console.log('   npm run migrate:supabase\n');
  
  const migrationsDir = path.join(__dirname, 'migrations', 'supabase');
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();
  
  console.log(`📋 Archivos de migración disponibles (${files.length}):`);
  files.forEach(file => {
    console.log(`   - ${file}`);
  });
  console.log();
}

async function main() {
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║                                                                ║');
  console.log('║   🎓 SGPTI - Configuración de Supabase                         ║');
  console.log('║                                                                ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');
  
  // 1. Check connection
  const connected = await checkConnection();
  if (!connected) {
    process.exit(1);
  }
  
  // 2. Check tables
  const existingTables = await checkTables();
  
  // 3. Check roles
  const rolesExist = existingTables.includes('roles');
  if (rolesExist) {
    const hasRoles = await testRoles();
    if (hasRoles) {
      console.log('✅ La base de datos está configurada correctamente');
      console.log('   Puedes iniciar el servidor con: npm start\n');
      return;
    }
  }
  
  // 4. Show migration instructions
  showMigrationInstructions();
  
  console.log('💡 Después de ejecutar las migraciones, ejecuta este script nuevamente');
  console.log('   para verificar que todo esté configurado correctamente.\n');
}

main().catch(error => {
  console.error('\n❌ Error:', error);
  process.exit(1);
});
