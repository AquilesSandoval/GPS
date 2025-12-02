# 🚀 Guía de Inicio Rápido - SGPTI

## ⚡ Configuración en 10 Minutos

### 1️⃣ Crear Cuenta en Supabase (3 min)

1. Ve a [https://supabase.com](https://supabase.com)
2. Haz clic en **Start your project**
3. Inicia sesión con GitHub o email
4. Crea un nuevo proyecto:
   - **Name**: `sgpti`
   - **Database Password**: Crea una contraseña segura (guárdala)
   - **Region**: Selecciona la más cercana
   - Haz clic en **Create new project**
5. Espera 2-3 minutos mientras se crea el proyecto

### 2️⃣ Obtener Credenciales (1 min)

1. En tu proyecto, haz clic en el ícono de **Settings** (⚙️) en la barra lateral
2. Selecciona **API**
3. Busca la sección **Project URL** y copia la URL
4. Busca la sección **Project API keys**
5. Copia la **anon public** key

### 3️⃣ Configurar Backend (1 min)

1. Abre el archivo `backend/.env` en un editor de texto
2. Reemplaza estas líneas:

```env
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co  ← Pega tu Project URL aquí
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... ← Pega tu anon key aquí
```

3. Guarda el archivo

### 4️⃣ Ejecutar Migraciones (2 min)

1. En Supabase, haz clic en **SQL Editor** en la barra lateral
2. Haz clic en **+ New query**
3. Abre el archivo `backend/migrations/supabase/001_create_migrations_table.sql`
4. Copia todo el contenido y pégalo en el editor de Supabase
5. Haz clic en **Run** (abajo a la derecha)
6. Repite los pasos 2-5 con el archivo `backend/migrations/supabase/002_create_users_table.sql`

### 5️⃣ Verificar Configuración (1 min)

Abre una terminal en la carpeta del proyecto y ejecuta:

```bash
cd backend
npm run setup:supabase
```

Deberías ver:
```
✅ Conexión a Supabase exitosa
✅ Tabla 'roles' existe
✅ Tabla 'users' existe
✅ Encontrados 4 roles
✅ La base de datos está configurada correctamente
```

### 6️⃣ Iniciar el Sistema (1 min)

**Abre 2 terminales:**

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
```bash
cd frontend
npm run dev
```

Deberías ver:
```
VITE ready in XXX ms
➜ Local: http://localhost:5173/
```

### 7️⃣ Probar el Registro (1 min)

1. Abre tu navegador en [http://localhost:5173](http://localhost:5173)
2. Haz clic en **Crear Cuenta** (o ve directamente a `/register`)
3. Verás 4 opciones de tipo de cuenta:
   - 🎓 **estudiante** - Proponer y gestionar proyectos de titulación
   - 👨‍🏫 **docente** - Asesorar estudiantes y revisar proyectos
   - 👔 **comite** - Supervisar el proceso y asignar revisores
   - 📚 **biblioteca** - Validar formato y archivar documentos
4. Selecciona un rol (debería mostrarse con borde azul)
5. Completa el formulario:
   - **Nombre**: Tu nombre
   - **Apellido**: Tu apellido
   - **Correo**: tu@email.com
   - **Matrícula/Empleado**: Un número de identificación
   - **Contraseña**: Mínimo 8 caracteres
   - **Confirmar contraseña**: La misma contraseña
6. Haz clic en **Crear Cuenta**
7. Si todo está correcto, serás redirigido al dashboard

## ✅ ¡Listo!

El sistema está funcionando. Ahora puedes:
- ✅ Registrar usuarios con diferentes roles
- ✅ Iniciar sesión
- ✅ Gestionar proyectos (según tu rol)

## 🆘 ¿Problemas?

### No aparecen los roles

**Solución:**
1. Verifica que el backend está corriendo (Terminal 1 debe mostrar "Supabase connected")
2. Abre la consola del navegador (F12) y busca errores
3. Verifica que ejecutaste ambas migraciones en Supabase

### Error "SUPABASE_URL y SUPABASE_ANON_KEY son requeridos"

**Solución:**
1. Verifica que editaste el archivo `backend/.env` (no `.env.example`)
2. Asegúrate de pegar las credenciales completas sin espacios adicionales
3. Reinicia el backend después de editar `.env`

### Las migraciones fallan en Supabase

**Solución:**
1. Ejecuta primero 001_create_migrations_table.sql
2. Luego ejecuta 002_create_users_table.sql
3. Si hay errores, léelos cuidadosamente - generalmente indican qué falta

### El frontend no se conecta al backend

**Solución:**
1. Verifica que ambos están corriendo (backend en 3000, frontend en 5173)
2. Verifica que no hay errores de CORS en la consola
3. El backend debe mostrar "✅ Supabase connected successfully"

## 📚 Más Información

- **Configuración detallada**: `backend/SETUP_INSTRUCTIONS.md`
- **Resumen completo**: `SOLUTION_SUMMARY.md`
- **Documentación de Supabase**: `backend/SUPABASE_*.md`

## 🎯 Recordatorio

El "problema del checkbox" mencionado originalmente no era sobre el tipo de input HTML. El frontend **ya usa radio buttons correctamente** para seleccionar un solo rol. El problema real era que:

1. ❌ Las dependencias no estaban instaladas
2. ❌ La base de datos no estaba configurada
3. ❌ El código usaba MySQL pero la configuración era para Supabase
4. ❌ Las migraciones no se habían ejecutado

Ahora todo está solucionado:

1. ✅ Dependencias instaladas
2. ✅ Base de datos configurada (después de que configures Supabase)
3. ✅ Código actualizado para usar Supabase correctamente
4. ✅ Migraciones creadas y listas para ejecutar

¡Disfruta usando SGPTI! 🎓
