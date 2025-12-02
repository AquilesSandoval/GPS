# Instrucciones de Configuración - SGPTI Backend

Este documento proporciona instrucciones paso a paso para configurar el backend del Sistema de Gestión de Proyectos de Titulación e Investigación.

## 📋 Requisitos Previos

1. Node.js 16 o superior
2. Una cuenta en [Supabase](https://supabase.com) (gratis)
3. npm instalado

## 🚀 Configuración Inicial

### Paso 1: Instalar Dependencias

```bash
cd backend
npm install
```

### Paso 2: Configurar Variables de Entorno

1. Copia el archivo de ejemplo:
```bash
cp .env.example .env
```

2. Obtén tus credenciales de Supabase:
   - Ve a [supabase.com](https://supabase.com)
   - Crea un nuevo proyecto o selecciona uno existente
   - Ve a **Settings** → **API**
   - Copia:
     - **URL del proyecto** (Project URL)
     - **Clave anónima** (anon public key)

3. Edita el archivo `.env` y actualiza estas líneas:
```env
SUPABASE_URL=https://tu-proyecto-ref.supabase.co
SUPABASE_ANON_KEY=tu-clave-anonima-aqui
```

### Paso 3: Ejecutar Migraciones en Supabase

Las tablas deben crearse en Supabase. Sigue estos pasos:

#### Opción A: Usando el SQL Editor de Supabase (Recomendado)

1. Ve a tu proyecto en [supabase.com](https://supabase.com)
2. Haz clic en **SQL Editor** en el menú lateral
3. Haz clic en **New Query**
4. Copia y pega el contenido del archivo `migrations/supabase/001_create_migrations_table.sql`
5. Haz clic en **Run** para ejecutar
6. Repite los pasos 3-5 para el archivo `migrations/supabase/002_create_users_table.sql`

#### Opción B: Ver las Migraciones en la Terminal

Puedes ver el contenido de las migraciones ejecutando:
```bash
npm run migrate:supabase
```

Este comando mostrará el SQL que necesitas ejecutar en Supabase.

### Paso 4: Verificar la Configuración

Ejecuta el script de verificación:
```bash
npm run setup:supabase
```

Este script verificará:
- ✅ Conexión a Supabase
- ✅ Existencia de tablas necesarias
- ✅ Existencia de roles en la base de datos

Si todo está configurado correctamente, verás:
```
✅ La base de datos está configurada correctamente
   Puedes iniciar el servidor con: npm start
```

### Paso 5: Iniciar el Servidor

```bash
npm start
```

O para desarrollo con auto-reload:
```bash
npm run dev
```

El servidor estará disponible en `http://localhost:3000`

## 🧪 Verificar que Todo Funcione

### Verificar Roles Disponibles

Haz una petición GET a:
```bash
curl http://localhost:3000/api/auth/roles
```

Deberías ver una respuesta con los 4 roles:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "estudiante",
      "description": "Proponentes de proyectos; gestiona postulaciones y sube entregables"
    },
    {
      "id": 2,
      "name": "docente",
      "description": "Guía a los estudiantes y realiza revisiones y aprobaciones técnicas"
    },
    {
      "id": 3,
      "name": "comite",
      "description": "Supervisa el proceso, asigna revisores, aprueba y notifica"
    },
    {
      "id": 4,
      "name": "biblioteca",
      "description": "Valida el formato y el archivo final de los documentos"
    }
  ]
}
```

### Probar el Registro

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "estudiante@ejemplo.com",
    "password": "password123",
    "firstName": "Juan",
    "lastName": "Pérez",
    "roleId": 1,
    "studentId": "20201234"
  }'
```

## 🔧 Solución de Problemas

### Error: "SUPABASE_URL y SUPABASE_ANON_KEY son requeridos"

- Verifica que el archivo `.env` existe en el directorio `backend/`
- Asegúrate de que las variables están correctamente configuradas
- No olvides los valores reales de Supabase

### Error: "Tabla 'roles' no existe"

- Ejecuta las migraciones en Supabase siguiendo el **Paso 3**
- Verifica que ambos archivos SQL fueron ejecutados correctamente

### Error al Conectar con Supabase

- Verifica que la URL de Supabase es correcta
- Verifica que la clave anónima es correcta
- Asegúrate de que tu proyecto en Supabase está activo

### No Aparecen los Roles en el Registro

- Verifica que el backend está ejecutándose
- Verifica que el frontend está configurado para conectarse al backend correcto
- Revisa la consola del navegador para errores de CORS o conexión

## 📚 Estructura de la Base de Datos

### Tablas Principales

1. **roles** - Roles del sistema (estudiante, docente, comite, biblioteca)
2. **users** - Usuarios del sistema
3. **migrations** - Control de migraciones ejecutadas

### Roles del Sistema

- **estudiante**: Proponer y gestionar proyectos de titulación
- **docente**: Asesorar estudiantes y revisar proyectos
- **comite**: Supervisar el proceso y asignar revisores
- **biblioteca**: Validar formato y archivar documentos

## 🔐 Seguridad

- Las contraseñas se almacenan hasheadas con bcrypt
- JWT se usa para autenticación
- Supabase maneja Row Level Security (RLS)
- Las credenciales nunca se comprometen en el código

## 📞 Soporte

Para más información:
- [Documentación de Supabase](https://supabase.com/docs)
- [Guía de Migración a Supabase](./SUPABASE_MIGRATION.md)
- [Ejemplos de Código Supabase](./SUPABASE_EXAMPLES.md)
