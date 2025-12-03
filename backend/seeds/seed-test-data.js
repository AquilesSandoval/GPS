const { supabase } = require('../src/config/database');
const bcrypt = require('bcryptjs');

/**
 * Seed script para crear usuarios y proyectos de prueba
 * Este script crea datos de prueba en la base de datos de Supabase
 */

const testUsers = [
  {
    email: 'estudiante@test.com',
    password: 'password123',
    firstName: 'Juan',
    lastName: 'Pérez',
    roleName: 'estudiante',
    studentId: '20201001',
    phone: '5551234567'
  },
  {
    email: 'estudiante2@test.com',
    password: 'password123',
    firstName: 'María',
    lastName: 'García',
    roleName: 'estudiante',
    studentId: '20201002',
    phone: '5551234568'
  },
  {
    email: 'docente@test.com',
    password: 'password123',
    firstName: 'Dr. Carlos',
    lastName: 'Rodríguez',
    roleName: 'docente',
    employeeId: 'DOC001',
    phone: '5551234569'
  },
  {
    email: 'docente2@test.com',
    password: 'password123',
    firstName: 'Dra. Ana',
    lastName: 'Martínez',
    roleName: 'docente',
    employeeId: 'DOC002',
    phone: '5551234570'
  },
  {
    email: 'comite@test.com',
    password: 'password123',
    firstName: 'Dr. Roberto',
    lastName: 'López',
    roleName: 'comite',
    employeeId: 'COM001',
    phone: '5551234571'
  },
  {
    email: 'biblioteca@test.com',
    password: 'password123',
    firstName: 'Lic. Patricia',
    lastName: 'Hernández',
    roleName: 'biblioteca',
    employeeId: 'BIB001',
    phone: '5551234572'
  }
];

const testProjects = [
  {
    title: 'Sistema de Gestión de Inventarios',
    description: 'Desarrollo de un sistema web para la gestión de inventarios en tiempo real utilizando React y Node.js',
    type: 'tesis',
    status: 'propuesta'
  },
  {
    title: 'Aplicación Móvil para Aprendizaje de Idiomas',
    description: 'Aplicación móvil educativa con IA para personalizar el aprendizaje de idiomas',
    type: 'proyecto',
    status: 'en_revision'
  },
  {
    title: 'Análisis de Datos de Redes Sociales con Machine Learning',
    description: 'Investigación sobre técnicas de ML para análisis de sentimientos en redes sociales',
    type: 'tesis',
    status: 'propuesta'
  }
];

async function getRoleIdByName(roleName) {
  const { data, error } = await supabase
    .from('roles')
    .select('id')
    .eq('name', roleName)
    .single();
  
  if (error) {
    throw new Error(`Error obteniendo rol ${roleName}: ${error.message}`);
  }
  
  return data.id;
}

async function createUser(userData) {
  // Hash password
  const hashedPassword = await bcrypt.hash(userData.password, 12);
  
  // Get role ID
  const roleId = await getRoleIdByName(userData.roleName);
  
  // Check if user already exists
  const { data: existing } = await supabase
    .from('users')
    .select('email')
    .eq('email', userData.email)
    .single();
  
  if (existing) {
    console.log(`  ⚠️  Usuario ${userData.email} ya existe, saltando...`);
    return null;
  }
  
  // Create user
  const { data, error } = await supabase
    .from('users')
    .insert({
      email: userData.email,
      password: hashedPassword,
      first_name: userData.firstName,
      last_name: userData.lastName,
      role_id: roleId,
      student_id: userData.studentId || null,
      employee_id: userData.employeeId || null,
      phone: userData.phone || null,
      is_active: true,
      email_verified: true
    })
    .select()
    .single();
  
  if (error) {
    throw new Error(`Error creando usuario ${userData.email}: ${error.message}`);
  }
  
  console.log(`  ✅ Usuario creado: ${userData.email} (${userData.roleName})`);
  return data;
}

async function createProject(projectData, studentId) {
  // Validate studentId
  if (!studentId) {
    console.log('  ⚠️  No hay estudiante disponible para asignar proyecto, saltando...');
    return null;
  }
  
  // Check if projects table exists
  const { error: tableError } = await supabase
    .from('projects')
    .select('count', { count: 'exact', head: true });
  
  if (tableError) {
    if (tableError.code === 'PGRST204' || tableError.message.includes('does not exist')) {
      console.log('  ℹ️  Tabla projects no existe aún, saltando creación de proyectos...');
      return null;
    }
  }
  
  // Check if project already exists
  const { data: existing } = await supabase
    .from('projects')
    .select('title')
    .eq('title', projectData.title)
    .single();
  
  if (existing) {
    console.log(`  ⚠️  Proyecto "${projectData.title}" ya existe, saltando...`);
    return null;
  }
  
  // Create project
  const { data, error } = await supabase
    .from('projects')
    .insert({
      title: projectData.title,
      description: projectData.description,
      type: projectData.type,
      status: projectData.status,
      student_id: studentId
    })
    .select()
    .single();
  
  if (error) {
    throw new Error(`Error creando proyecto "${projectData.title}": ${error.message}`);
  }
  
  console.log(`  ✅ Proyecto creado: "${projectData.title}"`);
  return data;
}

async function seed() {
  console.log('🌱 Iniciando seed de datos de prueba...\n');
  
  try {
    // Test connection
    const { error: connError } = await supabase
      .from('roles')
      .select('count', { count: 'exact', head: true });
    
    if (connError) {
      throw new Error(`Error conectando a Supabase: ${connError.message}`);
    }
    
    console.log('✅ Conexión a Supabase exitosa\n');
    
    // Create users
    console.log('📝 Creando usuarios de prueba...');
    const createdUsers = [];
    for (const userData of testUsers) {
      const user = await createUser(userData);
      if (user) {
        createdUsers.push({ ...user, plainPassword: userData.password });
      }
    }
    console.log('');
    
    // Create projects (only if table exists)
    console.log('📁 Creando proyectos de prueba...');
    
    // Get first student user
    const { data: students } = await supabase
      .from('users')
      .select('id')
      .eq('role_id', await getRoleIdByName('estudiante'))
      .limit(1);
    
    if (students && students.length > 0) {
      for (const projectData of testProjects) {
        await createProject(projectData, students[0].id);
      }
    } else {
      console.log('  ℹ️  No hay estudiantes para asignar proyectos');
    }
    console.log('');
    
    // Summary
    console.log('🎉 Seed completado exitosamente!\n');
    console.log('📋 Resumen de usuarios creados:');
    console.log('================================\n');
    
    testUsers.forEach(user => {
      console.log(`👤 ${user.firstName} ${user.lastName} (${user.roleName})`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   🔑 Contraseña: ${user.password}`);
      console.log(`   ${user.studentId ? '🎓 Matrícula' : '💼 Empleado'}: ${user.studentId || user.employeeId}`);
      console.log('');
    });
    
    console.log('💡 Tip: Usa estas credenciales para iniciar sesión y probar el sistema\n');
    
  } catch (error) {
    console.error('❌ Error durante el seed:', error.message);
    process.exit(1);
  }
}

// Run seed
if (require.main === module) {
  seed()
    .then(() => {
      console.log('✅ Proceso completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error fatal:', error);
      process.exit(1);
    });
}

module.exports = { seed, testUsers };
