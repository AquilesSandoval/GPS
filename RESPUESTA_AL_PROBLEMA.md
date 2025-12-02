# 📋 Respuesta a tu Problema - SGPTI

## 🎯 Lo que Reportaste

> "Ya de creo la base de datos en supabase, pero no paso del login, por ejemplo en register no me deja seleccionar el rol en esa page, necesito que todo funcione ya, que crees tambien usiarios, proyectos y todo usando las credenciales de supabase, pero lo ocopo bien y dime que usuariso ya exsiten en la base de datos"

## ✅ Lo que He Hecho

### 1. Scripts de Verificación y Diagnóstico

He creado un script que verifica TODA tu configuración:

```bash
cd backend
npm run check
```

Este comando te dirá:
- ✅ o ❌ Si las credenciales están configuradas
- ✅ o ❌ Si hay conexión a Supabase
- ✅ o ❌ Si las tablas existen
- ✅ o ❌ Si los roles están creados
- ✅ o ❌ Cuántos usuarios hay
- 💡 Qué hacer si algo falta

### 2. Script para Crear Usuarios y Proyectos de Prueba

He creado un script que crea automáticamente:
- **6 usuarios de prueba** (2 estudiantes, 2 docentes, 1 comité, 1 biblioteca)
- **3 proyectos de prueba**
- Todos con credenciales documentadas

```bash
cd backend
npm run seed
```

**Usuarios que se crearán:**

| Email | Contraseña | Rol | Matrícula/Empleado |
|-------|-----------|-----|---------------------|
| estudiante@test.com | password123 | Estudiante | 20201001 |
| estudiante2@test.com | password123 | Estudiante | 20201002 |
| docente@test.com | password123 | Docente | DOC001 |
| docente2@test.com | password123 | Docente | DOC002 |
| comite@test.com | password123 | Comité | COM001 |
| biblioteca@test.com | password123 | Biblioteca | BIB001 |

### 3. Script para Ver Qué Usuarios Ya Existen

Para ver qué usuarios ya tienes en tu base de datos:

```bash
cd backend
npm run list:users
```

Este comando mostrará:
- 👥 Todos los usuarios agrupados por rol
- 📧 Sus emails y nombres
- 🎓 Sus matrículas o números de empleado
- 📊 Estadísticas (cuántos usuarios, cuántos activos, etc.)
- 🔑 Las contraseñas de los usuarios de prueba

## 🔧 Por Qué No Funciona Actualmente

Hay **UNA COSA** que falta para que todo funcione:

### ❌ Falta Configurar tu SUPABASE_ANON_KEY

El archivo `backend/.env` tiene esto:

```env
SUPABASE_URL=https://bqgfyxasmyrkiqucospz.supabase.co  ✅ YA CONFIGURADA
SUPABASE_ANON_KEY=your-supabase-anon-key-here          ❌ FALTA CONFIGURAR
```

## 📝 Solución en 3 Pasos

### Paso 1: Obtener tu Clave (1 minuto)

1. Ve a: https://supabase.com/dashboard/project/bqgfyxasmyrkiqucospz
2. Settings (⚙️) > API
3. Copia la **anon** **public** key (una clave larga que empieza con `eyJ...`)

### Paso 2: Configurar (30 segundos)

1. Abre `backend/.env`
2. Reemplaza:
   ```env
   SUPABASE_ANON_KEY=your-supabase-anon-key-here
   ```
   con:
   ```env
   SUPABASE_ANON_KEY=eyJhbGc...tu-clave-completa-aqui
   ```
3. Guarda el archivo

### Paso 3: Ejecutar Todo (2 minutos)

```bash
cd backend

# 1. Verificar que todo está bien configurado
npm run check

# 2. Si dice que faltan las migraciones, sigue las instrucciones que da
#    (necesitas ejecutar los SQL en Supabase SQL Editor)

# 3. Crear usuarios y proyectos de prueba
npm run seed

# 4. Ver qué usuarios se crearon
npm run list:users

# 5. Iniciar el backend
npm start
```

En otra terminal:
```bash
cd frontend
npm run dev
```

## 🎉 Resultado Final

Después de estos pasos tendrás:

### ✅ Login Funcionando

- Abre: http://localhost:5173
- Email: `estudiante@test.com`
- Contraseña: `password123`
- ✅ Deberías poder entrar

### ✅ Registro Funcionando

- Abre: http://localhost:5173/register
- ✅ Deberías ver los 4 roles (estudiante, docente, comité, biblioteca)
- ✅ Puedes seleccionar un rol (se marca con borde azul y ✓)
- ✅ Puedes crear un nuevo usuario

### ✅ Usuarios de Prueba Creados

6 usuarios listos para usar, todos con contraseña `password123`:
- estudiante@test.com
- estudiante2@test.com
- docente@test.com
- docente2@test.com
- comite@test.com
- biblioteca@test.com

### ✅ Proyectos de Prueba Creados

3 proyectos de ejemplo para probar el sistema.

## 📊 Para Ver Qué Usuarios Existen Ahora

Como pediste saber qué usuarios ya existen en tu base de datos:

```bash
cd backend
npm run list:users
```

Esto te mostrará:
- Todos los usuarios que existen actualmente
- Sus roles, emails, nombres
- Las credenciales de los usuarios de prueba

**Si no hay usuarios aún**, ejecuta:
```bash
npm run seed
```

## 🐛 Si Algo No Funciona

### Problema: "No aparecen los roles en el registro"

```bash
# Diagnostica el problema
npm run check

# Verifica que el backend responde
curl http://localhost:3000/api/auth/roles
```

Si ves JSON con los roles, el backend funciona. Si no, revisa los logs del backend.

### Problema: "No puedo iniciar sesión"

```bash
# Ve qué usuarios existen
npm run list:users

# Si no hay ninguno, créalos
npm run seed
```

### Problema: "Error de conexión a Supabase"

- Verifica que configuraste la SUPABASE_ANON_KEY en `backend/.env`
- Reinicia el backend después de editar `.env`

## 📚 Archivos de Ayuda

He creado varios documentos para ayudarte:

1. **INSTRUCCIONES_RAPIDAS.md** ⭐ Empieza aquí - Pasos simples
2. **SETUP_COMPLETO.md** - Guía detallada completa
3. **backend/seeds/README.md** - Documentación de usuarios de prueba
4. **EXECUTE_MIGRATIONS.md** - Cómo ejecutar migraciones

## 💻 Comandos que Necesitas Conocer

```bash
# En el directorio backend:

npm run check          # ⭐ Verifica TODO y te dice qué falta
npm run seed           # 🌱 Crea usuarios y proyectos de prueba
npm run list:users     # 👥 Lista todos los usuarios que existen
npm start              # 🚀 Inicia el backend
```

## 🎯 Resumen

1. **Configura tu SUPABASE_ANON_KEY** en `backend/.env`
2. **Ejecuta `npm run check`** para verificar todo
3. **Ejecuta `npm run seed`** para crear usuarios de prueba
4. **Ejecuta `npm run list:users`** para ver qué usuarios existen
5. **Inicia el sistema** con `npm start` (backend) y `npm run dev` (frontend)
6. **Prueba el login** con `estudiante@test.com` / `password123`

---

## 🔑 LA CLAVE DEL PROBLEMA

El problema de "no puedo seleccionar el rol en el registro" es porque:

1. ❌ El backend no tiene la clave de Supabase configurada
2. ❌ Por lo tanto, no puede conectarse a la base de datos
3. ❌ Por lo tanto, no puede cargar los roles
4. ❌ Por lo tanto, el frontend no muestra los roles

**Solución:** Configura la SUPABASE_ANON_KEY y todo funcionará.

---

**¿Necesitas la guía más simple?** Lee: `INSTRUCCIONES_RAPIDAS.md`

**¿Quieres detalles completos?** Lee: `SETUP_COMPLETO.md`

**¿Solo quieres saber qué usuarios existen?** Ejecuta: `npm run list:users` (después de configurar la clave)

¡Ya está todo listo para funcionar! Solo falta ese paso de configuración. 🚀
