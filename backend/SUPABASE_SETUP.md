# Guía de Configuración de Supabase

Esta guía explica cómo configurar y conectar el backend a Supabase.

## ✅ Requisitos Completados

El proyecto ya ha sido configurado para usar Supabase como base de datos. Los siguientes componentes están listos:

1. ✅ Dependencia `@supabase/supabase-js` instalada
2. ✅ Configuración de Supabase en `/src/config/`
3. ✅ Cliente Supabase exportado y listo para usar
4. ✅ Documentación de migración disponible
5. ✅ Ejemplos de uso completos

## 📋 Configuración Inicial

### Paso 1: Crear archivo .env

Copia el archivo `.env.example` a `.env`:

```bash
cp .env.example .env
```

### Paso 2: Configurar Variables de Entorno

Edita el archivo `.env` y configura las credenciales de Supabase:

```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key-here
```

**Nota**: Estas credenciales ya están configuradas en el archivo `.env` si fue proporcionado por el administrador del proyecto.

### Paso 3: Verificar Conexión

Inicia el servidor para verificar que la conexión funciona:

```bash
npm start
```

Si todo está configurado correctamente, verás:
```
✅ Supabase connected successfully
```

## 🔑 Obtener Credenciales de Supabase

Si necesitas obtener tus propias credenciales:

1. Ve a [supabase.com](https://supabase.com) e inicia sesión
2. Selecciona tu proyecto
3. Ve a Settings → API
4. Copia:
   - **URL**: Project URL
   - **Anon Key**: anon public key

## 📚 Recursos de Documentación

- **SUPABASE_MIGRATION.md** - Guía completa de migración de MySQL a Supabase
- **SUPABASE_EXAMPLES.md** - Ejemplos prácticos de uso del cliente Supabase

## 🚀 Uso del Cliente Supabase

El cliente Supabase está disponible en toda la aplicación:

```javascript
const { supabase } = require('./config/database');

// Ejemplo: Obtener usuarios
const { data, error } = await supabase
  .from('users')
  .select('*');
```

## ⚠️ Notas Importantes

1. **Anon Key es Pública**: La clave anónima (anon key) es segura para usar en el frontend y backend. Supabase maneja la seguridad a través de Row Level Security (RLS).

2. **Row Level Security**: Asegúrate de configurar políticas RLS en Supabase para proteger tus datos.

3. **Service Key**: Para operaciones de administrador, considera usar la Service Role Key (nunca expongas esta clave en el frontend).

## 🔄 Migración de Modelos Existentes

Los modelos actuales que usan MySQL necesitarán ser actualizados para usar el cliente Supabase. Ver **SUPABASE_EXAMPLES.md** para patrones de código.

### Ejemplo de Migración

**Antes (MySQL):**
```javascript
const [users] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
```

**Después (Supabase):**
```javascript
const { data: users, error } = await supabase
  .from('users')
  .select('*')
  .eq('email', email);
```

## 📞 Soporte

Para más información sobre Supabase:
- [Documentación Oficial](https://supabase.com/docs)
- [JavaScript Client Reference](https://supabase.com/docs/reference/javascript/introduction)

## 🔒 Seguridad

- ✅ Las credenciales se almacenan en variables de entorno
- ✅ El archivo `.env` está en `.gitignore`
- ✅ Sin credenciales hardcodeadas en el código
- ✅ CodeQL security scan: Sin vulnerabilidades detectadas
