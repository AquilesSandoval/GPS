# 🚀 Ejecutar Migraciones en Supabase

## ⚡ Configuración Completa

La configuración de Supabase está lista. Solo necesitas ejecutar las migraciones en la consola SQL de Supabase.

### ✅ Lo que ya está configurado:
- ✅ URL de Supabase: `https://bqgfyxasmyrkiqucospz.supabase.co`
- ✅ Clave anónima configurada en `.env`
- ✅ Dependencias instaladas
- ✅ Modelo User actualizado para usar Supabase

## 📝 Pasos para Ejecutar las Migraciones

### 1. Abrir SQL Editor en Supabase

1. Ve a: https://supabase.com/dashboard/project/bqgfyxasmyrkiqucospz
2. Inicia sesión si no lo has hecho
3. Haz clic en **SQL Editor** en el menú lateral izquierdo
4. Haz clic en **+ New query** (botón verde arriba a la derecha)

### 2. Ejecutar Primera Migración

Copia y pega el siguiente SQL en el editor:

```sql
-- =====================================================
-- SGPTI - Sistema de Gestión de Proyectos de Titulación
-- Migración: Crear tabla de migraciones
-- PostgreSQL/Supabase version
-- =====================================================

CREATE TABLE IF NOT EXISTS migrations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

Haz clic en **Run** (o presiona Ctrl+Enter)

**Resultado esperado:** ✅ Success. No rows returned

### 3. Ejecutar Segunda Migración

Crea una nueva query (**+ New query**) y copia el siguiente SQL:

```sql
-- =====================================================
-- SGPTI - Sistema de Gestión de Proyectos de Titulación
-- Migración: Crear tabla de usuarios (RF01)
-- PostgreSQL/Supabase version
-- =====================================================

-- Tabla de roles
CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_roles_updated_at
  BEFORE UPDATE ON roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insertar roles predefinidos
INSERT INTO roles (name, description) VALUES
  ('estudiante', 'Proponentes de proyectos; gestiona postulaciones y sube entregables'),
  ('docente', 'Guía a los estudiantes y realiza revisiones y aprobaciones técnicas'),
  ('comite', 'Supervisa el proceso, asigna revisores, aprueba y notifica'),
  ('biblioteca', 'Valida el formato y el archivo final de los documentos')
ON CONFLICT (name) DO NOTHING;

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  uuid UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role_id INTEGER NOT NULL,
  student_id VARCHAR(50) DEFAULT NULL,
  employee_id VARCHAR(50) DEFAULT NULL,
  phone VARCHAR(20) DEFAULT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  email_verified BOOLEAN DEFAULT FALSE,
  last_login TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role_id);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Tabla para tokens de recuperación de contraseña
CREATE TABLE IF NOT EXISTS password_resets (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  token VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_password_resets_token ON password_resets(token);
CREATE INDEX IF NOT EXISTS idx_password_resets_expires ON password_resets(expires_at);
```

Haz clic en **Run** (o presiona Ctrl+Enter)

**Resultado esperado:** ✅ Success. 4 rows returned (los 4 roles insertados)

### 4. Verificar las Tablas

En el menú lateral, haz clic en **Table Editor**

Deberías ver estas tablas:
- ✅ `migrations`
- ✅ `roles` (con 4 filas)
- ✅ `users` (vacía)
- ✅ `password_resets` (vacía)

Haz clic en la tabla `roles` para verificar que tiene estos 4 registros:

| id | name        | description                                                           |
|----|-------------|-----------------------------------------------------------------------|
| 1  | estudiante  | Proponentes de proyectos; gestiona postulaciones y sube entregables  |
| 2  | docente     | Guía a los estudiantes y realiza revisiones y aprobaciones técnicas   |
| 3  | comite      | Supervisa el proceso, asigna revisores, aprueba y notifica            |
| 4  | biblioteca  | Valida el formato y el archivo final de los documentos               |

## 🎉 Iniciar el Sistema

Ahora que las tablas están creadas, puedes iniciar el sistema:

### Terminal 1 - Backend

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

### Terminal 2 - Frontend

```bash
cd frontend
npm install  # Solo la primera vez
npm run dev
```

Deberías ver:
```
VITE ready in XXX ms
➜ Local: http://localhost:5173/
```

### Probar el Registro

1. Abre http://localhost:5173 en tu navegador
2. Ve a la página de registro
3. Deberías ver 4 opciones de rol:
   - 🎓 **estudiante** - Proponer y gestionar proyectos de titulación
   - 👨‍🏫 **docente** - Asesorar estudiantes y revisar proyectos
   - 👔 **comite** - Supervisar el proceso y asignar revisores
   - 📚 **biblioteca** - Validar formato y archivar documentos
4. Selecciona un rol (se marcará con borde azul y check ✓)
5. Completa el formulario y registra un usuario

## ✅ Verificación Final

Para verificar que todo funciona:

```bash
# Desde el directorio backend
curl http://localhost:3000/api/auth/roles
```

Debería responder con los 4 roles en formato JSON.

## 🐛 Solución de Problemas

### Error: "tabla roles no existe"

**Causa:** Las migraciones no se ejecutaron correctamente.

**Solución:**
1. Ve al SQL Editor en Supabase
2. Ejecuta: `SELECT * FROM roles;`
3. Si da error "tabla no existe", ejecuta de nuevo la segunda migración

### Backend no conecta a Supabase

**Causa:** Credenciales incorrectas o problemas de red.

**Solución:**
1. Verifica que `backend/.env` tenga las credenciales correctas
2. Reinicia el backend después de modificar `.env`
3. Verifica que el proyecto de Supabase esté activo (no pausado)

### No aparecen los roles en el frontend

**Causa:** Backend no está corriendo o hay error de CORS.

**Solución:**
1. Verifica que el backend esté corriendo en http://localhost:3000
2. Abre la consola del navegador (F12) y busca errores
3. Prueba `curl http://localhost:3000/api/auth/roles` para verificar

## 📚 Archivos de Referencia

- `backend/migrations/supabase/001_create_migrations_table.sql` - Primera migración
- `backend/migrations/supabase/002_create_users_table.sql` - Segunda migración
- `backend/.env` - Configuración (ya configurada con tus credenciales)
- `QUICK_START.md` - Guía rápida de inicio
- `TESTING_CHECKLIST.md` - Lista completa de verificación

## 🎯 Resumen

1. ✅ Credenciales configuradas
2. ⏳ **EJECUTAR:** Migraciones en Supabase SQL Editor (pasos 1-3 arriba)
3. ⏳ **INICIAR:** Backend y Frontend (paso 4)
4. ⏳ **PROBAR:** Registro con selección de rol (paso 5)

¡Ya casi está listo! Solo falta ejecutar las 2 migraciones SQL en Supabase.
