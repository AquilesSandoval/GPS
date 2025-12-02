# 👋 ¡LÉEME PRIMERO!

## 🎯 Tu Problema: "No puedo seleccionar el rol en el registro"

**La solución está lista.** Solo necesitas un paso más.

## ⚡ Solución en 3 Pasos (3 minutos)

### Paso 1: Obtener tu clave de Supabase (1 minuto)

1. Ve aquí: https://supabase.com/dashboard/project/bqgfyxasmyrkiqucospz
2. Haz clic en **Settings** (⚙️) > **API**
3. Copia la **anon** **public** key (empieza con `eyJ...`)

### Paso 2: Configurar (30 segundos)

1. Abre el archivo `backend/.env`
2. Busca esta línea:
   ```
   SUPABASE_ANON_KEY=your-supabase-anon-key-here
   ```
3. Reemplázala con tu clave:
   ```
   SUPABASE_ANON_KEY=eyJhbGc...tu-clave-aqui
   ```
4. **Guarda el archivo**

### Paso 3: Ejecutar (1-2 minutos)

Abre una terminal y ejecuta:

```bash
cd backend
npm run check
```

Este comando te dirá exactamente qué hacer a continuación.

## 📚 Guías Disponibles

Según lo que necesites:

- **⚡ INSTRUCCIONES_RAPIDAS.md** ← Empieza aquí
  - Pasos simples y directos
  - Lo que necesitas para que todo funcione

- **📖 RESPUESTA_AL_PROBLEMA.md**
  - Explicación de por qué no funcionaba
  - Qué he hecho para solucionarlo
  - Lista de usuarios y proyectos que se crearán

- **📘 SETUP_COMPLETO.md**
  - Guía detallada paso a paso
  - Solución de problemas
  - Información completa

## 🔑 Usuarios de Prueba

Después de ejecutar `npm run seed`, tendrás estos usuarios (contraseña: `password123`):

- `estudiante@test.com` (Estudiante)
- `docente@test.com` (Docente)
- `comite@test.com` (Comité)
- `biblioteca@test.com` (Biblioteca)

## 💻 Comandos Importantes

```bash
# Ver el estado de tu configuración
npm run check

# Crear usuarios de prueba
npm run seed

# Ver qué usuarios existen
npm run list:users

# Iniciar el backend
npm start
```

## ✅ Lo Que Ya Está Listo

- ✅ Código del backend y frontend
- ✅ Scripts de verificación
- ✅ Scripts para crear usuarios y proyectos
- ✅ Documentación completa
- ✅ Tu URL de Supabase configurada

## ⏳ Lo Que Falta (solo 1 paso)

- ⏳ Configurar tu SUPABASE_ANON_KEY

---

**🚀 Siguiente Paso:** Lee `INSTRUCCIONES_RAPIDAS.md` y sigue los 3 pasos.

**❓ ¿Dudas?** Todo está explicado en las guías.

**🎯 Resumen:** Necesitas poner tu clave de Supabase en `backend/.env`, luego ejecutar `npm run check`.
