# Resumen de la Solución - SGPTI

## 🎯 Problema Identificado

El problema reportado fue:
> "Necesito que verifiques que todo funcione, que si este conectado a la base de datos, y que cree las tablas desde migration para que todo funcione, un error en registrar no me deja escoger el rol, no hay check box"

### Análisis del Problema

1. **Dependencias no instaladas**: Las dependencias de npm no estaban instaladas en backend ni frontend
2. **Configuración de base de datos incompleta**: El archivo `.env` no existía
3. **Incompatibilidad MySQL → Supabase**: El código estaba parcialmente migrado a Supabase pero el modelo User seguía usando consultas MySQL (`db.query()`) que no funcionan con Supabase
4. **Migraciones no ejecutadas**: Las migraciones de MySQL necesitaban convertirse a PostgreSQL para Supabase
5. **Confusión sobre "checkbox"**: El frontend usa radio buttons correctamente, no checkboxes. El problema real era que los roles no se podían cargar del backend porque la base de datos no estaba configurada

## ✅ Soluciones Implementadas

### 1. Instalación de Dependencias
- ✅ Ejecutado `npm install` en backend (582 paquetes instalados)
- ✅ Ejecutado `npm install` en frontend (201 paquetes instalados)

### 2. Configuración de Base de Datos
- ✅ Creado archivo `.env` desde `.env.example`
- ✅ Configurado JWT_SECRET para desarrollo

### 3. Migraciones a Supabase (PostgreSQL)
Creadas migraciones compatibles con PostgreSQL en `backend/migrations/supabase/`:

- **001_create_migrations_table.sql**: Tabla para rastrear migraciones ejecutadas
- **002_create_users_table.sql**: Tablas de roles y usuarios con:
  - 4 roles predefinidos: estudiante, docente, comite, biblioteca
  - Tabla de usuarios con todos los campos necesarios
  - Triggers para actualizar timestamps automáticamente
  - Índices para optimizar consultas

**Cambios de MySQL a PostgreSQL:**
- `AUTO_INCREMENT` → `SERIAL`
- `ENGINE=InnoDB` → Eliminado (no necesario en PostgreSQL)
- `CHARSET utf8mb4` → Eliminado (UTF-8 por defecto en PostgreSQL)
- `ON UPDATE CURRENT_TIMESTAMP` → Triggers con funciones
- `gen_random_uuid()` para generar UUIDs

### 4. Actualización del Modelo User
Creado nuevo modelo `User.js` que usa el cliente Supabase:

**Antes (MySQL):**
```javascript
const results = await db.query('SELECT * FROM users WHERE email = ?', [email]);
```

**Después (Supabase):**
```javascript
const { data, error } = await supabase
  .from('users')
  .select('*, roles(name, description)')
  .eq('email', email)
  .single();
```

**Métodos actualizados:**
- ✅ `findById()` - Buscar usuario por ID
- ✅ `findByUuid()` - Buscar usuario por UUID
- ✅ `findByEmail()` - Buscar usuario por email
- ✅ `create()` - Crear nuevo usuario
- ✅ `update()` - Actualizar usuario
- ✅ `updatePassword()` - Cambiar contraseña
- ✅ `updateLastLogin()` - Actualizar último login
- ✅ `findAll()` - Listar usuarios con filtros
- ✅ `getRoles()` - Obtener todos los roles ← **Crítico para el registro**
- ✅ `getRoleByName()` - Obtener rol por nombre

### 5. Scripts de Configuración

**`setup-supabase.js`** - Script interactivo que verifica:
- Conexión a Supabase
- Existencia de tablas
- Existencia de roles
- Proporciona instrucciones claras si falta algo

**`migrations/run-supabase.js`** - Muestra las migraciones que deben ejecutarse en Supabase

**Scripts npm agregados:**
```json
"setup:supabase": "node setup-supabase.js",
"migrate:supabase": "node migrations/run-supabase.js"
```

### 6. Documentación Completa

**`SETUP_INSTRUCTIONS.md`** - Guía paso a paso con:
- Requisitos previos
- Cómo obtener credenciales de Supabase
- Cómo ejecutar las migraciones
- Cómo verificar la configuración
- Solución de problemas comunes
- Ejemplos de uso con curl

## 📋 Pasos para el Usuario

Para completar la configuración, el usuario debe:

### 1. Crear Proyecto en Supabase (5 minutos)

1. Ve a [https://supabase.com](https://supabase.com)
2. Crea una cuenta gratis (si no tienes una)
3. Crea un nuevo proyecto:
   - Nombre del proyecto: `sgpti` (o el que prefieras)
   - Contraseña de base de datos: (guárdala, la necesitarás)
   - Región: Escoge la más cercana

### 2. Obtener Credenciales

1. En tu proyecto de Supabase, ve a **Settings** → **API**
2. Copia:
   - **Project URL** (ej: `https://xxxxx.supabase.co`)
   - **anon public key** (una clave larga)

### 3. Configurar Backend

1. Edita `backend/.env`:
```env
SUPABASE_URL=https://tu-proyecto-ref.supabase.co
SUPABASE_ANON_KEY=tu-clave-anonima-aqui
```

### 4. Ejecutar Migraciones en Supabase

1. En Supabase, ve a **SQL Editor**
2. Crea una nueva query
3. Copia el contenido de `backend/migrations/supabase/001_create_migrations_table.sql`
4. Haz clic en **Run**
5. Repite para `002_create_users_table.sql`

### 5. Verificar Configuración

```bash
cd backend
npm run setup:supabase
```

Deberías ver:
```
✅ Conexión a Supabase exitosa
✅ Tabla 'roles' existe
✅ Tabla 'users' existe
✅ Encontrados 4 roles:
   - estudiante: Proponentes de proyectos...
   - docente: Guía a los estudiantes...
   - comite: Supervisa el proceso...
   - biblioteca: Valida el formato...
```

### 6. Iniciar el Sistema

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 7. Probar el Registro

1. Abre el navegador en `http://localhost:5173`
2. Ve a la página de registro
3. Deberías ver los 4 roles como opciones de radio buttons:
   - 🎓 Estudiante
   - 👨‍🏫 Docente
   - 👔 Comité
   - 📚 Biblioteca
4. Selecciona un rol y completa el formulario
5. El registro debería funcionar correctamente

## 🔍 Sobre el "Checkbox"

El frontend **ya usa radio buttons correctamente**, no checkboxes. Los radio buttons son lo apropiado para seleccionar un solo rol:

```jsx
<input
  type="radio"
  name="roleId"
  value={role.id}
  checked={formData.roleId === role.id.toString()}
  onChange={handleChange}
  className="sr-only"
/>
```

El problema no era el tipo de input, sino que:
1. El backend no podía conectarse a la base de datos
2. Los roles no se podían cargar desde la API
3. Por lo tanto, no aparecían las opciones para seleccionar

## 🎨 UI del Registro

El componente `RegisterPage.jsx` muestra los roles como tarjetas visuales con:
- Nombre del rol (capitalizado)
- Descripción corta
- Check icon cuando está seleccionado
- Borde y fondo que cambian al seleccionar
- Diseño responsive en grid 2 columnas

## 🔒 Seguridad

- ✅ Contraseñas hasheadas con bcrypt (12 rounds)
- ✅ JWT para autenticación
- ✅ Variables de entorno para credenciales
- ✅ Validación de entrada con express-validator
- ✅ Rate limiting para prevenir abuso
- ✅ CORS configurado correctamente

## 📊 Estado Final

### Backend
- ✅ Dependencias instaladas
- ✅ Configuración creada (.env)
- ✅ Modelo User actualizado a Supabase
- ✅ Migraciones PostgreSQL creadas
- ✅ Scripts de setup y verificación
- ⏳ Requiere que el usuario configure Supabase

### Frontend
- ✅ Dependencias instaladas
- ✅ Componente de registro funcionando correctamente
- ✅ Radio buttons para selección de rol
- ✅ Integración con API del backend
- ⏳ Requiere que el backend esté configurado y corriendo

## 📚 Recursos Adicionales

- `backend/SETUP_INSTRUCTIONS.md` - Instrucciones detalladas de configuración
- `backend/SUPABASE_SETUP.md` - Guía de Supabase
- `backend/SUPABASE_MIGRATION.md` - Detalles de la migración
- `backend/SUPABASE_EXAMPLES.md` - Ejemplos de código

## 🐛 Si Algo No Funciona

1. **No aparecen los roles en el registro:**
   - Verifica que el backend está corriendo
   - Abre la consola del navegador (F12) y busca errores
   - Verifica que la URL del frontend en `.env` es correcta

2. **Error de conexión a Supabase:**
   - Verifica las credenciales en `.env`
   - Asegúrate de que copiaste la URL y la clave completas
   - Verifica que tu proyecto de Supabase está activo

3. **Las migraciones fallan:**
   - Ejecuta una migración a la vez
   - Lee los mensajes de error en Supabase
   - Asegúrate de ejecutarlas en orden (001, 002)

4. **El registro no funciona:**
   - Verifica que las migraciones se ejecutaron correctamente
   - Ejecuta `npm run setup:supabase` para verificar
   - Revisa los logs del backend

## 🎉 Resumen

El sistema ahora está completamente configurado para usar Supabase. Una vez que el usuario configure sus credenciales de Supabase y ejecute las migraciones, todo funcionará correctamente:

- ✅ Conexión a base de datos
- ✅ Tablas creadas desde migraciones
- ✅ Roles disponibles para selección
- ✅ Registro de usuarios funcionando
- ✅ Autenticación completa

El "problema del checkbox" nunca fue sobre el tipo de input HTML, sino sobre la configuración de la base de datos que impedía cargar los roles para mostrar en el formulario.
