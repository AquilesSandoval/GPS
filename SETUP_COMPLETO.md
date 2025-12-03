# 🚀 Guía de Configuración Completa - SGPTI

## 📋 Situación Actual

Ya tienes:
- ✅ Proyecto de Supabase creado
- ✅ Código del backend y frontend
- ✅ Dependencias instaladas

Necesitas:
- ⏳ Configurar las credenciales de Supabase
- ⏳ Verificar que las migraciones estén ejecutadas
- ⏳ Crear usuarios de prueba
- ⏳ Probar login y registro

## 🎯 Pasos para Completar la Configuración

### Paso 1: Configurar Credenciales de Supabase (2 minutos)

1. **Obtener las credenciales:**
   - Ve a: https://supabase.com/dashboard/project/bqgfyxasmyrkiqucospz
   - Haz clic en **Settings** (⚙️) en el menú lateral
   - Selecciona **API**
   - Copia el **Project URL**: `https://bqgfyxasmyrkiqucospz.supabase.co`
   - Copia el **anon public** key (una clave larga que empieza con `eyJ...`)

2. **Configurar el archivo .env:**
   
   Abre el archivo `backend/.env` y actualiza estas líneas:
   
   ```env
   SUPABASE_URL=https://bqgfyxasmyrkiqucospz.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxZ2Z5eGFzbXlya2lxdWNvc3B6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI5NzE4NDAsImV4cCI6MjA0ODU0Nzg0MH0.abcdefghijklmnopqrstuvwxyz1234567890
   ```
   
   ⚠️ **Reemplaza** `SUPABASE_ANON_KEY` con tu clave real que copiaste de Supabase.

3. **Guardar el archivo**

### Paso 2: Verificar Configuración (1 minuto)

Abre una terminal en el directorio del proyecto y ejecuta:

```bash
cd backend
npm run check
```

Este comando verificará:
- ✅ Credenciales configuradas correctamente
- ✅ Conexión a Supabase
- ✅ Existencia de tablas
- ✅ Existencia de roles
- ✅ Usuarios en la base de datos

**Posibles resultados:**

#### Resultado A: "Credenciales no configuradas"
Si ves este mensaje, vuelve al Paso 1 y asegúrate de:
- Copiar la clave completa (sin espacios)
- Guardar el archivo .env
- Usar la clave correcta (anon public, no service_role)

#### Resultado B: "Tabla roles no existe"
Necesitas ejecutar las migraciones. Ve al Paso 3.

#### Resultado C: "Todo está configurado correctamente"
¡Excelente! Salta al Paso 4.

### Paso 3: Ejecutar Migraciones (si es necesario) (3 minutos)

Si el Paso 2 indicó que faltan tablas:

1. **Abrir Supabase SQL Editor:**
   - Ve a: https://supabase.com/dashboard/project/bqgfyxasmyrkiqucospz
   - Haz clic en **SQL Editor** en el menú lateral
   - Haz clic en **+ New query**

2. **Ejecutar primera migración:**
   
   Copia y pega este SQL:
   
   ```sql
   CREATE TABLE IF NOT EXISTS migrations (
     id SERIAL PRIMARY KEY,
     name VARCHAR(255) NOT NULL UNIQUE,
     executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```
   
   Haz clic en **Run** (o presiona Ctrl+Enter)
   
   Deberías ver: ✅ Success. No rows returned

3. **Ejecutar segunda migración:**
   
   Haz clic en **+ New query** de nuevo
   
   Copia el contenido completo del archivo: `backend/migrations/supabase/002_create_users_table.sql`
   
   Haz clic en **Run**
   
   Deberías ver: ✅ Success. 4 rows returned (los 4 roles)

4. **Verificar en Table Editor:**
   - Haz clic en **Table Editor** en el menú lateral
   - Deberías ver las tablas: `migrations`, `roles`, `users`, `password_resets`
   - Haz clic en `roles` para ver los 4 roles creados

5. **Verificar de nuevo:**
   ```bash
   npm run check
   ```
   
   Ahora deberías ver: ✅ Todo está configurado correctamente

### Paso 4: Crear Usuarios de Prueba (1 minuto)

Para tener usuarios con los que probar el sistema:

```bash
npm run seed
```

Este comando creará 6 usuarios de prueba:
- 2 estudiantes
- 2 docentes
- 1 miembro del comité
- 1 bibliotecario

Todos con la contraseña: **password123**

**Salida esperada:**
```
🌱 Iniciando seed de datos de prueba...

✅ Conexión a Supabase exitosa

📝 Creando usuarios de prueba...
  ✅ Usuario creado: estudiante@test.com (estudiante)
  ✅ Usuario creado: estudiante2@test.com (estudiante)
  ✅ Usuario creado: docente@test.com (docente)
  ✅ Usuario creado: docente2@test.com (docente)
  ✅ Usuario creado: comite@test.com (comite)
  ✅ Usuario creado: biblioteca@test.com (biblioteca)

...
```

### Paso 5: Listar Usuarios Existentes (30 segundos)

Para ver qué usuarios hay en la base de datos:

```bash
npm run list:users
```

Este comando mostrará:
- Todos los usuarios agrupados por rol
- Sus emails, nombres, y datos de contacto
- Estadísticas generales
- Credenciales de usuarios de prueba

### Paso 6: Iniciar el Sistema (1 minuto)

**Terminal 1 - Backend:**

```bash
cd backend
npm start
```

Deberías ver:
```
✅ Supabase connected successfully
🎓 SGPTI - Sistema de Gestión de Proyectos de Titulación
   Servidor iniciado en: http://localhost:3000
```

**Terminal 2 - Frontend:**

Abre una **nueva terminal** y ejecuta:

```bash
cd frontend
npm run dev
```

Deberías ver:
```
VITE ready in XXX ms
➜ Local: http://localhost:5173/
```

### Paso 7: Probar el Sistema (2 minutos)

#### Probar Login

1. Abre tu navegador en: http://localhost:5173
2. Haz clic en **Iniciar Sesión**
3. Usa estas credenciales:
   - Email: `estudiante@test.com`
   - Contraseña: `password123`
4. Deberías ser redirigido al dashboard

#### Probar Registro

1. Ve a: http://localhost:5173/register
2. Deberías ver **4 opciones de rol**:
   - 🎓 Estudiante
   - 👨‍🏫 Docente
   - 👔 Comité
   - 📚 Biblioteca
3. Selecciona un rol (debería marcarse con borde azul y ✓)
4. Completa el formulario:
   - Nombre: Tu nombre
   - Apellido: Tu apellido
   - Email: tu@email.com (diferente a los de prueba)
   - Matrícula/Empleado: Un número
   - Contraseña: Mínimo 8 caracteres
   - Confirmar contraseña: La misma
5. Haz clic en **Crear Cuenta**
6. Deberías ser redirigido al dashboard

## ✅ Verificación Final

Ejecuta todos estos comandos para verificar que todo funciona:

```bash
# 1. Verificar configuración
npm run check

# 2. Listar usuarios
npm run list:users

# 3. Verificar que el backend responde
curl http://localhost:3000/api/auth/roles
```

Deberías ver JSON con los 4 roles.

## 🔑 Usuarios de Prueba Disponibles

Después de ejecutar `npm run seed`, puedes usar estos usuarios:

| Email | Contraseña | Rol | ID |
|-------|-----------|-----|-----|
| estudiante@test.com | password123 | Estudiante | 20201001 |
| estudiante2@test.com | password123 | Estudiante | 20201002 |
| docente@test.com | password123 | Docente | DOC001 |
| docente2@test.com | password123 | Docente | DOC002 |
| comite@test.com | password123 | Comité | COM001 |
| biblioteca@test.com | password123 | Biblioteca | BIB001 |

## 🐛 Solución de Problemas

### Problema: "No aparecen los roles en el registro"

**Diagnóstico:**
```bash
# Verifica que el backend esté corriendo
curl http://localhost:3000/api/auth/roles

# Deberías ver JSON con los roles
```

**Soluciones:**
1. Verifica que el backend está corriendo (`npm start` en backend/)
2. Abre la consola del navegador (F12) y busca errores
3. Ejecuta `npm run check` para verificar la configuración
4. Verifica que ejecutaste las migraciones

### Problema: "Error de conexión a Supabase"

**Soluciones:**
1. Verifica las credenciales en `backend/.env`
2. Asegúrate de copiar la clave completa sin espacios
3. Reinicia el backend después de editar `.env`
4. Verifica que tu proyecto de Supabase está activo

### Problema: "No se puede iniciar sesión"

**Soluciones:**
1. Ejecuta `npm run list:users` para ver qué usuarios existen
2. Verifica que el email y contraseña son correctos
3. Si no hay usuarios, ejecuta `npm run seed`
4. Revisa los logs del backend para ver el error específico

### Problema: "Tabla no existe"

**Soluciones:**
1. Ejecuta las migraciones en Supabase (Paso 3)
2. Ejecuta `npm run check` para ver qué falta
3. Ve a Supabase Table Editor y verifica las tablas

## 💡 Comandos Útiles

```bash
# Verificar configuración completa
npm run check

# Crear usuarios de prueba
npm run seed

# Listar usuarios existentes
npm run list:users

# Verificar conexión básica
npm run setup:supabase

# Iniciar backend
npm start

# Iniciar backend en modo desarrollo (auto-reload)
npm run dev
```

## 📚 Archivos de Referencia

- `EXECUTE_MIGRATIONS.md` - Guía detallada de migraciones
- `QUICK_START.md` - Guía rápida
- `backend/seeds/README.md` - Documentación de scripts de seed
- `SOLUTION_SUMMARY.md` - Análisis del problema y solución

## 🎉 ¡Listo para Usar!

Una vez completados todos los pasos:

1. ✅ Credenciales configuradas
2. ✅ Migraciones ejecutadas
3. ✅ Usuarios de prueba creados
4. ✅ Backend corriendo
5. ✅ Frontend corriendo
6. ✅ Login y registro funcionando

**Puedes empezar a usar el sistema:**
- Login con usuarios de prueba
- Registrar nuevos usuarios
- Crear proyectos (desde estudiantes)
- Revisar proyectos (desde docentes)
- Gestionar el flujo completo

## 🆘 ¿Necesitas Ayuda?

Si algo no funciona:

1. Ejecuta `npm run check` y lee el diagnóstico
2. Revisa esta guía paso a paso
3. Verifica los logs del backend y frontend
4. Revisa la consola del navegador (F12) en el frontend

¡Todo está configurado para funcionar! 🚀
