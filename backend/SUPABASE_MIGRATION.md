# Migración a Supabase

Este documento describe la migración del sistema de MySQL a Supabase.

## Cambios Realizados

### 1. Dependencias
Se agregó el paquete `@supabase/supabase-js` al proyecto:
```bash
npm install @supabase/supabase-js
```

### 2. Configuración de Variables de Entorno

El archivo `.env.example` y `.env` fueron actualizados para incluir:

```env
SUPABASE_URL=https://bqgfyxasmyrkiqucospz.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxZ2Z5eGFzbXlya2lxdWNvc3B6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3MDA3OTYsImV4cCI6MjA4MDI3Njc5Nn0.mn4ljnZWIHH-XtxtC9BkolM-Z6CHr9J7snvMOWqxgXI
```

### 3. Configuración del Cliente Supabase

**Archivo**: `src/config/index.js`

Se agregó la configuración de Supabase:
```javascript
supabase: {
  url: process.env.SUPABASE_URL || 'https://bqgfyxasmyrkiqucospz.supabase.co',
  anonKey: process.env.SUPABASE_ANON_KEY || '<anon-key>',
}
```

**Archivo**: `src/config/database.js`

Se reemplazó la configuración de MySQL por Supabase:
- Se crea el cliente Supabase usando `createClient()`
- Se exporta el cliente `supabase` para uso en toda la aplicación
- Se mantiene una capa de compatibilidad básica para el código legacy

## Uso del Cliente Supabase

### Ejemplo de Consultas

```javascript
const { supabase } = require('./config/database');

// SELECT
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('email', 'user@example.com');

// INSERT
const { data, error } = await supabase
  .from('users')
  .insert({ name: 'John Doe', email: 'john@example.com' });

// UPDATE
const { data, error } = await supabase
  .from('users')
  .update({ name: 'Jane Doe' })
  .eq('id', userId);

// DELETE
const { data, error } = await supabase
  .from('users')
  .delete()
  .eq('id', userId);
```

## Próximos Pasos

Los siguientes archivos necesitan ser actualizados para usar el cliente Supabase:

1. **Modelos** (`src/models/`):
   - `User.js`
   - `Project.js`
   - `Document.js`
   - `Comment.js`
   - `Notification.js`

2. **Controladores** (`src/controllers/`):
   - Todos los controladores que usan `pool.execute()` deben migrar a `supabase.from()`

3. **Migraciones**:
   - Las migraciones de MySQL necesitan convertirse a SQL de PostgreSQL
   - Considerar usar Supabase Migrations o crear tablas directamente desde el dashboard

## Diferencias Importantes

### MySQL vs PostgreSQL (Supabase)
- **Tipos de datos**: Revisar tipos de datos (ej: `TEXT` en MySQL vs `text` en PostgreSQL)
- **Auto-increment**: En PostgreSQL se usa `SERIAL` o `BIGSERIAL`
- **Sintaxis**: Algunas funciones SQL difieren entre MySQL y PostgreSQL

### Autenticación
- Supabase incluye un sistema de autenticación integrado
- Considerar migrar de JWT custom a Supabase Auth

## Conexión a la Base de Datos

La aplicación ahora se conecta automáticamente a Supabase usando la URL y el Anon Key proporcionados.

### Información de Conexión
- **URL**: https://bqgfyxasmyrkiqucospz.supabase.co
- **Project Ref**: bqgfyxasmyrkiqucospz
- **Role**: anon (clave pública)

## Recursos

- [Documentación de Supabase](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Migración de MySQL a PostgreSQL](https://supabase.com/docs/guides/migrations/mysql)
