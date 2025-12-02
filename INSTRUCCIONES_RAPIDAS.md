# 🚀 Instrucciones Rápidas - SGPTI

## ⚡ Resumen de la Situación

Tu base de datos en Supabase ya está creada en: `https://bqgfyxasmyrkiqucospz.supabase.co`

## 📝 Lo Que Falta Para Que Todo Funcione

### Paso 1: Obtener tu Clave de Supabase (1 minuto)

1. Ve a: https://supabase.com/dashboard/project/bqgfyxasmyrkiqucospz
2. Inicia sesión si no lo has hecho
3. Haz clic en **Settings** (⚙️) en el menú lateral izquierdo
4. Selecciona **API**
5. En la sección **Project API keys**, copia la **anon** **public** key
   - Es una clave larga que empieza con `eyJ...`
   - ⚠️ **NO uses** la `service_role` key, necesitas la **anon** key

### Paso 2: Configurar el Backend (1 minuto)

1. Abre el archivo `backend/.env` en un editor de texto
2. Encuentra esta línea:
   ```
   SUPABASE_ANON_KEY=your-supabase-anon-key-here
   ```
3. Reemplázala con tu clave real:
   ```
   SUPABASE_ANON_KEY=eyJhbGc...tu-clave-completa-aqui
   ```
4. **Guarda el archivo**

### Paso 3: Verificar Todo (30 segundos)

Abre una terminal en el directorio del proyecto y ejecuta:

```bash
cd backend
npm run check
```

Este comando te dirá exactamente qué falta y cómo solucionarlo.

**Posibles Resultados:**

#### ✅ Si dice "Todo está configurado correctamente"

¡Perfecto! Continúa al Paso 4.

#### ⚠️ Si dice "Tabla roles no existe" o "Necesitas ejecutar las migraciones"

Ejecuta las migraciones:

1. Ve a: https://supabase.com/dashboard/project/bqgfyxasmyrkiqucospz
2. Haz clic en **SQL Editor** en el menú lateral
3. Haz clic en **+ New query**
4. Copia el contenido del archivo `backend/migrations/supabase/001_create_migrations_table.sql`
5. Pégalo en el editor y haz clic en **Run**
6. Crea otra nueva query y repite con `backend/migrations/supabase/002_create_users_table.sql`
7. Vuelve a ejecutar `npm run check`

#### ❌ Si dice "Credenciales no configuradas" o "SUPABASE_ANON_KEY no está configurada"

Vuelve al Paso 1 y asegúrate de:
- Copiar la clave completa (sin espacios al inicio o final)
- Guardar el archivo `.env`
- Usar la clave **anon** (no service_role)

### Paso 4: Crear Usuarios de Prueba (30 segundos)

```bash
npm run seed
```

Esto creará 6 usuarios de prueba con la contraseña: **password123**

### Paso 5: Iniciar el Sistema (1 minuto)

**Terminal 1:**
```bash
cd backend
npm start
```

Espera a ver: ✅ Supabase connected successfully

**Terminal 2 (nueva terminal):**
```bash
cd frontend
npm run dev
```

### Paso 6: Probar (1 minuto)

1. Abre tu navegador en: http://localhost:5173
2. Haz clic en **Iniciar Sesión**
3. Usa:
   - Email: `estudiante@test.com`
   - Contraseña: `password123`

O ve a **Registro** y verifica que puedes:
- Ver los 4 roles (estudiante, docente, comité, biblioteca)
- Seleccionar uno (se marca con borde azul y ✓)
- Crear un nuevo usuario

## 🔑 Usuarios de Prueba Disponibles

Después del Paso 4, tendrás estos usuarios (todos con contraseña `password123`):

- `estudiante@test.com` - Estudiante (Matrícula: 20201001)
- `estudiante2@test.com` - Estudiante (Matrícula: 20201002)
- `docente@test.com` - Docente (Empleado: DOC001)
- `docente2@test.com` - Docente (Empleado: DOC002)
- `comite@test.com` - Comité (Empleado: COM001)
- `biblioteca@test.com` - Biblioteca (Empleado: BIB001)

## 💡 Comandos Útiles

```bash
# Ver qué usuarios existen en la base de datos
npm run list:users

# Verificar configuración y estado
npm run check

# Crear más usuarios de prueba (puedes ejecutarlo múltiples veces)
npm run seed
```

## 🐛 Problemas Comunes

### "No aparecen los roles en el registro"

**Causa:** El backend no está conectado o las migraciones no se ejecutaron.

**Solución:**
1. Ejecuta `npm run check` para ver qué falta
2. Verifica que el backend está corriendo (`npm start`)
3. Abre la consola del navegador (F12) y busca errores

### "Error de conexión a Supabase"

**Causa:** La SUPABASE_ANON_KEY no es correcta.

**Solución:**
1. Ve a Supabase Settings > API
2. Copia de nuevo la **anon public** key (la clave completa)
3. Pégala en `backend/.env`
4. Reinicia el backend

### "No puedo iniciar sesión"

**Causa:** No hay usuarios creados.

**Solución:**
1. Ejecuta `npm run list:users` para ver qué usuarios existen
2. Si no hay ninguno, ejecuta `npm run seed`
3. Usa las credenciales de prueba: `estudiante@test.com` / `password123`

## 📚 Más Ayuda

- **SETUP_COMPLETO.md** - Guía detallada paso a paso
- **EXECUTE_MIGRATIONS.md** - Cómo ejecutar migraciones
- **backend/seeds/README.md** - Documentación de usuarios de prueba

## ✅ Checklist

- [ ] Obtuve mi SUPABASE_ANON_KEY de Supabase
- [ ] Configuré `backend/.env` con la clave
- [ ] Ejecuté `npm run check` y todo está OK
- [ ] Ejecuté las migraciones (si era necesario)
- [ ] Ejecuté `npm run seed` para crear usuarios
- [ ] Inicié el backend (`npm start`)
- [ ] Inicié el frontend (`npm run dev`)
- [ ] Probé el login con `estudiante@test.com` / `password123`
- [ ] Verifiqué que en registro aparecen los 4 roles

---

**¿Todo funciona?** 🎉 ¡Perfecto! Ya puedes usar el sistema.

**¿Algo no funciona?** Ejecuta `npm run check` y sigue las instrucciones que te da.
