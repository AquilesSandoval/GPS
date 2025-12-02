const { supabase } = require('../src/config/database');

/**
 * Script para listar todos los usuarios existentes en la base de datos
 */

async function listUsers() {
  console.log('👥 Listando usuarios en la base de datos...\n');
  
  try {
    // Test connection
    const { error: connError } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true });
    
    if (connError) {
      throw new Error(`Error conectando a Supabase: ${connError.message}`);
    }
    
    console.log('✅ Conexión a Supabase exitosa\n');
    
    // Get all users with their role information
    const { data: users, error } = await supabase
      .from('users')
      .select(`
        id,
        uuid,
        email,
        first_name,
        last_name,
        student_id,
        employee_id,
        phone,
        is_active,
        email_verified,
        last_login,
        created_at,
        roles (
          name,
          description
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      throw new Error(`Error obteniendo usuarios: ${error.message}`);
    }
    
    if (!users || users.length === 0) {
      console.log('ℹ️  No hay usuarios en la base de datos\n');
      console.log('💡 Ejecuta "npm run seed" para crear usuarios de prueba\n');
      return;
    }
    
    console.log(`📊 Total de usuarios: ${users.length}\n`);
    console.log('=' .repeat(80));
    console.log('');
    
    // Group by role
    const usersByRole = users.reduce((acc, user) => {
      const roleName = user.roles?.name || 'sin rol';
      if (!acc[roleName]) {
        acc[roleName] = [];
      }
      acc[roleName].push(user);
      return acc;
    }, {});
    
    // Display users grouped by role
    Object.entries(usersByRole).forEach(([roleName, roleUsers]) => {
      console.log(`\n📌 ${roleName.toUpperCase()} (${roleUsers.length})`);
      console.log('-'.repeat(80));
      
      roleUsers.forEach((user, index) => {
        console.log(`\n${index + 1}. ${user.first_name} ${user.last_name}`);
        console.log(`   📧 Email: ${user.email}`);
        console.log(`   🆔 UUID: ${user.uuid}`);
        console.log(`   🎓 Matrícula: ${user.student_id || 'N/A'}`);
        console.log(`   💼 Empleado: ${user.employee_id || 'N/A'}`);
        console.log(`   📱 Teléfono: ${user.phone || 'N/A'}`);
        console.log(`   ${user.is_active ? '✅' : '❌'} Activo: ${user.is_active ? 'Sí' : 'No'}`);
        console.log(`   ${user.email_verified ? '✅' : '⚠️'} Email verificado: ${user.email_verified ? 'Sí' : 'No'}`);
        console.log(`   🕒 Último login: ${user.last_login ? new Date(user.last_login).toLocaleString() : 'Nunca'}`);
        console.log(`   📅 Creado: ${new Date(user.created_at).toLocaleString()}`);
      });
      
      console.log('');
    });
    
    console.log('=' .repeat(80));
    console.log('');
    
    // Display summary statistics
    const activeUsers = users.filter(u => u.is_active).length;
    const verifiedUsers = users.filter(u => u.email_verified).length;
    const usersWithLogin = users.filter(u => u.last_login).length;
    
    console.log('📈 Estadísticas:');
    console.log(`   • Total de usuarios: ${users.length}`);
    
    const calcPercentage = (count, total) => total > 0 ? Math.round(count/total*100) : 0;
    console.log(`   • Usuarios activos: ${activeUsers} (${calcPercentage(activeUsers, users.length)}%)`);
    console.log(`   • Emails verificados: ${verifiedUsers} (${calcPercentage(verifiedUsers, users.length)}%)`);
    console.log(`   • Han iniciado sesión: ${usersWithLogin} (${calcPercentage(usersWithLogin, users.length)}%)`);
    console.log('');
    
    // Display test credentials if they exist
    const testEmails = [
      'estudiante@test.com',
      'estudiante2@test.com',
      'docente@test.com',
      'docente2@test.com',
      'comite@test.com',
      'biblioteca@test.com'
    ];
    
    const testUsers = users.filter(u => testEmails.includes(u.email));
    
    if (testUsers.length > 0) {
      console.log('🔑 Usuarios de prueba encontrados:');
      console.log('   Contraseña para todos: password123');
      console.log('');
      testUsers.forEach(user => {
        console.log(`   • ${user.email} (${user.roles?.name})`);
      });
      console.log('');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  listUsers()
    .then(() => {
      console.log('✅ Proceso completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error fatal:', error);
      process.exit(1);
    });
}

module.exports = { listUsers };
