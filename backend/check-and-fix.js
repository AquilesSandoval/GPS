const { supabase } = require('./src/config/database');
const config = require('./src/config');

/**
 * Script completo para verificar y diagnosticar problemas de configuración
 * Verifica: conexión, credenciales, tablas, roles y usuarios
 */

async function checkSupabaseCredentials() {
  console.log('🔑 Verificando credenciales de Supabase...');
  
  if (!config.supabase.url || config.supabase.url === 'https://your-project-ref.supabase.co') {
    console.log('   ❌ SUPABASE_URL no está configurada o usa el valor por defecto');
    console.log('   💡 Edita backend/.env y configura SUPABASE_URL');
    return false;
  }
  
  if (!config.supabase.anonKey || config.supabase.anonKey === 'your-supabase-anon-key-here') {
    console.log('   ❌ SUPABASE_ANON_KEY no está configurada o usa el valor por defecto');
    console.log('   💡 Edita backend/.env y configura SUPABASE_ANON_KEY');
    return false;
  }
  
  console.log(`   ✅ SUPABASE_URL: ${config.supabase.url}`);
  console.log(`   ✅ SUPABASE_ANON_KEY: ${config.supabase.anonKey.substring(0, 20)}...`);
  return true;
}

async function checkConnection() {
  console.log('\n🔌 Verificando conexión a Supabase...');
  
  try {
    const { error } = await supabase
      .from('roles')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.log(`   ❌ Error de conexión: ${error.message}`);
      if (error.message.includes('Invalid API key')) {
        console.log('   💡 La SUPABASE_ANON_KEY no es válida. Verifica que copiaste la clave completa.');
      } else if (error.message.includes('Failed to fetch')) {
        console.log('   💡 No se puede conectar a Supabase. Verifica tu conexión a internet.');
      }
      return false;
    }
    
    console.log('   ✅ Conexión exitosa a Supabase');
    return true;
  } catch (error) {
    console.log(`   ❌ Error inesperado: ${error.message}`);
    return false;
  }
}

async function checkTable(tableName, expectedMinRows = 0) {
  try {
    const { data, error, count } = await supabase
      .from(tableName)
      .select('*', { count: 'exact' })
      .limit(1);
    
    if (error) {
      if (error.code === 'PGRST204' || error.message.includes('does not exist')) {
        console.log(`   ❌ Tabla "${tableName}" no existe`);
        return { exists: false, count: 0 };
      }
      throw error;
    }
    
    console.log(`   ✅ Tabla "${tableName}" existe (${count || 0} registros)`);
    
    if (expectedMinRows > 0 && (count || 0) < expectedMinRows) {
      console.log(`   ⚠️  Se esperaban al menos ${expectedMinRows} registros`);
      return { exists: true, count: count || 0, hasEnoughRows: false };
    }
    
    return { exists: true, count: count || 0, hasEnoughRows: true };
  } catch (error) {
    console.log(`   ❌ Error verificando tabla "${tableName}": ${error.message}`);
    return { exists: false, count: 0, error: error.message };
  }
}

async function checkRoles() {
  console.log('\n🎭 Verificando roles...');
  
  const rolesCheck = await checkTable('roles', 4);
  
  if (!rolesCheck.exists) {
    console.log('   💡 Necesitas ejecutar las migraciones en Supabase');
    console.log('   📝 Ver archivo: EXECUTE_MIGRATIONS.md');
    return false;
  }
  
  if (!rolesCheck.hasEnoughRows) {
    console.log('   💡 Faltan roles. Ejecuta la migración 002_create_users_table.sql');
    return false;
  }
  
  // List roles
  const { data: roles } = await supabase
    .from('roles')
    .select('*')
    .order('id');
  
  if (roles) {
    console.log('   📋 Roles disponibles:');
    roles.forEach(role => {
      console.log(`      ${role.id}. ${role.name} - ${role.description}`);
    });
  }
  
  return true;
}

async function checkUsers() {
  console.log('\n👥 Verificando usuarios...');
  
  const usersCheck = await checkTable('users');
  
  if (!usersCheck.exists) {
    console.log('   💡 Necesitas ejecutar las migraciones en Supabase');
    return false;
  }
  
  if (usersCheck.count === 0) {
    console.log('   ℹ️  No hay usuarios en la base de datos');
    console.log('   💡 Ejecuta "npm run seed" para crear usuarios de prueba');
    return true;
  }
  
  // List some users
  const { data: users } = await supabase
    .from('users')
    .select(`
      email,
      first_name,
      last_name,
      is_active,
      roles (name)
    `)
    .limit(5);
  
  if (users && users.length > 0) {
    console.log(`   📋 Primeros ${users.length} usuarios:`);
    users.forEach((user, i) => {
      console.log(`      ${i + 1}. ${user.first_name} ${user.last_name} (${user.email}) - ${user.roles?.name}`);
    });
    
    if (usersCheck.count > 5) {
      console.log(`      ... y ${usersCheck.count - 5} más`);
    }
  }
  
  return true;
}

async function checkProjects() {
  console.log('\n📁 Verificando proyectos...');
  
  const projectsCheck = await checkTable('projects');
  
  if (!projectsCheck.exists) {
    console.log('   ℹ️  Tabla de proyectos aún no existe (se creará con migración 003)');
    return true;
  }
  
  if (projectsCheck.count === 0) {
    console.log('   ℹ️  No hay proyectos en la base de datos');
    console.log('   💡 Los proyectos se crean desde la aplicación o con el script de seed');
    return true;
  }
  
  console.log(`   ✅ Existen ${projectsCheck.count} proyectos`);
  return true;
}

async function provideDiagnostics() {
  console.log('\n' + '='.repeat(80));
  console.log('🏥 DIAGNÓSTICO Y SOLUCIONES');
  console.log('='.repeat(80));
  
  // Check credentials
  const hasCredentials = await checkSupabaseCredentials();
  
  if (!hasCredentials) {
    console.log('\n❌ PROBLEMA: Credenciales no configuradas');
    console.log('\n📝 SOLUCIÓN:');
    
    // Extract project ID from URL if available
    const projectId = config.supabase.url?.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
    const dashboardUrl = projectId 
      ? `https://supabase.com/dashboard/project/${projectId}`
      : 'https://supabase.com/dashboard';
    
    console.log(`1. Ve a ${dashboardUrl}`);
    console.log('2. Ve a Settings > API');
    console.log('3. Copia el "Project URL" y el "anon public" key');
    console.log('4. Edita backend/.env y configura:');
    console.log('   SUPABASE_URL=<tu-url-aqui>');
    console.log('   SUPABASE_ANON_KEY=<tu-clave-aqui>');
    console.log('5. Guarda el archivo y vuelve a ejecutar este script\n');
    return;
  }
  
  // Check connection
  const connected = await checkConnection();
  
  if (!connected) {
    console.log('\n❌ PROBLEMA: No se puede conectar a Supabase');
    console.log('\n📝 SOLUCIÓN:');
    console.log('1. Verifica que las credenciales en .env son correctas');
    console.log('2. Verifica tu conexión a internet');
    console.log('3. Verifica que tu proyecto de Supabase está activo (no pausado)\n');
    return;
  }
  
  // Check tables and data
  const rolesOk = await checkRoles();
  const usersOk = await checkUsers();
  await checkProjects();
  
  // Final recommendations
  console.log('\n' + '='.repeat(80));
  console.log('📊 RESUMEN Y PRÓXIMOS PASOS');
  console.log('='.repeat(80));
  
  if (!rolesOk) {
    console.log('\n⚠️  ACCIÓN REQUERIDA: Ejecutar migraciones');
    console.log('   Ver archivo: EXECUTE_MIGRATIONS.md');
    console.log('   O ejecuta: npm run migrate:supabase');
  } else if (usersOk) {
    console.log('\n✅ Todo está configurado correctamente!');
    console.log('\n🚀 SIGUIENTE PASO:');
    console.log('1. Si no hay usuarios, ejecuta: npm run seed');
    console.log('2. Inicia el backend: npm start');
    console.log('3. Inicia el frontend: cd ../frontend && npm run dev');
    console.log('4. Abre http://localhost:5173 y prueba el login/registro');
  }
  
  console.log('\n💡 COMANDOS ÚTILES:');
  console.log('   npm run seed           - Crear usuarios de prueba');
  console.log('   npm run list:users     - Listar usuarios existentes');
  console.log('   npm run setup:supabase - Verificar configuración');
  console.log('');
}

// Run diagnostics
if (require.main === module) {
  console.log('🔍 SGPTI - Verificación y Diagnóstico del Sistema');
  console.log('='.repeat(80));
  console.log('');
  
  provideDiagnostics()
    .then(() => {
      console.log('✅ Verificación completada');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Error fatal:', error);
      process.exit(1);
    });
}

module.exports = { 
  checkSupabaseCredentials,
  checkConnection,
  checkTable,
  checkRoles,
  checkUsers,
  checkProjects 
};
