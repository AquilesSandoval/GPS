# 🌱 Scripts de Seed - SGPTI

Este directorio contiene scripts para poblar la base de datos con datos de prueba y listar usuarios existentes.

## 📝 Scripts Disponibles

### 1. `seed-test-data.js` - Crear Datos de Prueba

Crea usuarios y proyectos de prueba en la base de datos de Supabase.

**Uso:**
```bash
npm run seed
```

**Usuarios creados:**

| Email | Contraseña | Rol | ID |
|-------|-----------|-----|-----|
| estudiante@test.com | password123 | Estudiante | 20201001 (matrícula) |
| estudiante2@test.com | password123 | Estudiante | 20201002 (matrícula) |
| docente@test.com | password123 | Docente | DOC001 (empleado) |
| docente2@test.com | password123 | Docente | DOC002 (empleado) |
| comite@test.com | password123 | Comité | COM001 (empleado) |
| biblioteca@test.com | password123 | Biblioteca | BIB001 (empleado) |

**Proyectos creados:**
- Sistema de Gestión de Inventarios (tesis, propuesta)
- Aplicación Móvil para Aprendizaje de Idiomas (proyecto, en_revisión)
- Análisis de Datos de Redes Sociales con Machine Learning (tesis, propuesta)

**Características:**
- ✅ No crea duplicados (verifica si el usuario ya existe)
- ✅ Hashea las contraseñas con bcrypt
- ✅ Verifica emails automáticamente para usuarios de prueba
- ✅ Muestra resumen con credenciales al finalizar
- ⚠️ Solo crea proyectos si la tabla existe

### 2. `list-users.js` - Listar Usuarios Existentes

Lista todos los usuarios en la base de datos con información detallada.

**Uso:**
```bash
npm run list:users
```

**Información mostrada:**
- Nombre completo y email
- UUID
- Matrícula o número de empleado
- Teléfono
- Estado (activo/inactivo)
- Email verificado
- Último login
- Fecha de creación

**Características:**
- ✅ Agrupa usuarios por rol
- ✅ Muestra estadísticas generales
- ✅ Identifica usuarios de prueba y muestra sus contraseñas
- ✅ Muestra información formateada y fácil de leer

## 🚀 Flujo de Trabajo Recomendado

### Primera Vez

1. **Verifica la configuración:**
   ```bash
   npm run check
   ```

2. **Ejecuta las migraciones** (si no lo has hecho):
   - Ver `EXECUTE_MIGRATIONS.md`
   - O ejecuta manualmente en Supabase SQL Editor

3. **Crea usuarios de prueba:**
   ```bash
   npm run seed
   ```

4. **Verifica los usuarios creados:**
   ```bash
   npm run list:users
   ```

5. **Inicia el sistema:**
   ```bash
   npm start
   ```

### Desarrollo

- Para ver qué usuarios existen: `npm run list:users`
- Para agregar más usuarios de prueba: Edita `seed-test-data.js` y ejecuta `npm run seed`
- Para resetear usuarios de prueba: Elimina manualmente en Supabase y ejecuta `npm run seed`

## 🔑 Credenciales de Prueba

Todos los usuarios de prueba usan la contraseña: **password123**

Puedes usar cualquiera de estos para probar el login:

```
estudiante@test.com / password123
docente@test.com / password123
comite@test.com / password123
biblioteca@test.com / password123
```

## 💡 Tips

### Agregar Más Usuarios de Prueba

Edita el array `testUsers` en `seed-test-data.js`:

```javascript
const testUsers = [
  // ... usuarios existentes
  {
    email: 'nuevo@test.com',
    password: 'password123',
    firstName: 'Nuevo',
    lastName: 'Usuario',
    roleName: 'estudiante',  // estudiante, docente, comite, o biblioteca
    studentId: '20201003',    // para estudiantes
    // employeeId: 'EMP003',  // para otros roles
    phone: '5551234573'
  }
];
```

### Agregar Más Proyectos

Edita el array `testProjects` en `seed-test-data.js`:

```javascript
const testProjects = [
  // ... proyectos existentes
  {
    title: 'Mi Nuevo Proyecto',
    description: 'Descripción detallada...',
    type: 'tesis',     // tesis o proyecto
    status: 'propuesta' // propuesta, en_revision, aprobado, etc.
  }
];
```

### Eliminar Usuarios de Prueba

En Supabase:
1. Ve a Table Editor > users
2. Filtra por email que contenga "@test.com"
3. Selecciona y elimina los registros

O usando SQL en Supabase SQL Editor:
```sql
DELETE FROM users WHERE email LIKE '%@test.com';
```

## ⚠️ Notas Importantes

1. **Contraseñas:** Los usuarios de prueba usan contraseñas simples. En producción, las contraseñas deben ser fuertes y únicas.

2. **Email verificado:** Los usuarios de prueba tienen `email_verified = true` para facilitar las pruebas. En producción, esto requiere un proceso de verificación.

3. **Duplicados:** El script verifica si un usuario ya existe (por email) antes de crearlo, así que es seguro ejecutarlo múltiples veces.

4. **Proyectos:** Solo se crean proyectos si la tabla `projects` existe. Si ves un mensaje de que la tabla no existe, necesitas ejecutar la migración correspondiente.

## 🐛 Solución de Problemas

### Error: "Error conectando a Supabase"

**Causa:** Credenciales incorrectas o falta de conexión.

**Solución:**
1. Verifica `backend/.env` tiene las credenciales correctas
2. Ejecuta `npm run check` para verificar la configuración
3. Verifica tu conexión a internet

### Error: "Tabla roles no existe"

**Causa:** Las migraciones no se han ejecutado.

**Solución:**
1. Ejecuta las migraciones en Supabase SQL Editor
2. Ver archivo `EXECUTE_MIGRATIONS.md`

### Error: "Usuario ya existe"

**Causa:** Intentas crear un usuario con un email que ya existe.

**Solución:**
- Esto es normal y el script lo maneja automáticamente
- Si quieres recrear el usuario, elimínalo primero en Supabase

### No se crean proyectos

**Causa:** La tabla `projects` no existe aún.

**Solución:**
- Los proyectos requieren la migración 003_create_projects_table.sql
- Por ahora, los proyectos se pueden crear desde la aplicación web

## 📚 Archivos Relacionados

- `../check-and-fix.js` - Script de diagnóstico completo
- `../setup-supabase.js` - Verificación básica de Supabase
- `../EXECUTE_MIGRATIONS.md` - Guía para ejecutar migraciones
- `../QUICK_START.md` - Guía de inicio rápido

## 🎯 Resumen

| Comando | Propósito |
|---------|-----------|
| `npm run seed` | Crear usuarios y proyectos de prueba |
| `npm run list:users` | Listar todos los usuarios |
| `npm run check` | Verificar configuración completa |

¡Usa estos scripts para poblar tu base de datos y facilitar el desarrollo y testing! 🚀
