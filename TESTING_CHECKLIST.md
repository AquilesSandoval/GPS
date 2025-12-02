# ✅ Lista de Verificación - SGPTI

## Pre-requisitos

### Backend
- [x] Dependencias instaladas (`npm install` en `/backend`)
- [x] Archivo `.env` creado
- [ ] Credenciales de Supabase configuradas en `.env`
- [ ] Migraciones ejecutadas en Supabase

### Frontend
- [x] Dependencias instaladas (`npm install` en `/frontend`)
- [x] Build exitoso

## 1. Verificación de Configuración de Supabase

### 1.1 Crear Proyecto en Supabase
- [ ] Cuenta creada en https://supabase.com
- [ ] Proyecto creado con nombre `sgpti` (o similar)
- [ ] Proyecto está activo (no pausado)

### 1.2 Obtener Credenciales
- [ ] `SUPABASE_URL` copiada desde Settings → API → Project URL
- [ ] `SUPABASE_ANON_KEY` copiada desde Settings → API → anon public key
- [ ] Credenciales actualizadas en `backend/.env`

### 1.3 Ejecutar Migraciones
- [ ] Abierto SQL Editor en Supabase
- [ ] Ejecutada migración `001_create_migrations_table.sql` sin errores
- [ ] Ejecutada migración `002_create_users_table.sql` sin errores
- [ ] Verificado que aparecen las tablas: `migrations`, `roles`, `users`, `password_resets`

### 1.4 Verificar Configuración
```bash
cd backend
npm run setup:supabase
```

- [ ] Muestra "✅ Conexión a Supabase exitosa"
- [ ] Muestra "✅ Tabla 'roles' existe"
- [ ] Muestra "✅ Tabla 'users' existe"
- [ ] Muestra "✅ Encontrados 4 roles"
- [ ] Los 4 roles son: estudiante, docente, comite, biblioteca

## 2. Verificación del Backend

### 2.1 Iniciar Backend
```bash
cd backend
npm start
```

Verificar salida:
- [ ] Muestra "✅ Supabase connected successfully"
- [ ] Muestra "🎓 SGPTI - Sistema de Gestión de Proyectos de Titulación"
- [ ] Muestra "Servidor iniciado en: http://localhost:3000"
- [ ] No hay errores en consola

### 2.2 Probar Endpoints

#### Test 1: Health Check
```bash
curl http://localhost:3000/
```
- [ ] Responde con JSON
- [ ] `success: true`
- [ ] Muestra version y nombre del sistema

#### Test 2: Obtener Roles
```bash
curl http://localhost:3000/api/auth/roles
```
- [ ] Responde con JSON
- [ ] `success: true`
- [ ] `data` contiene array con 4 roles
- [ ] Cada rol tiene: `id`, `name`, `description`

Roles esperados:
```json
[
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
```

## 3. Verificación del Frontend

### 3.1 Iniciar Frontend
```bash
cd frontend
npm run dev
```

Verificar salida:
- [ ] Muestra "VITE ready in XXX ms"
- [ ] Muestra "➜ Local: http://localhost:5173/"
- [ ] No hay errores en consola

### 3.2 Abrir en Navegador
- [ ] Navegar a http://localhost:5173
- [ ] La página carga sin errores
- [ ] Aparece la página de inicio o login

## 4. Verificación del Registro

### 4.1 Acceder a Página de Registro
- [ ] Navegar a http://localhost:5173/register (o hacer clic en "Crear Cuenta")
- [ ] La página carga sin errores
- [ ] Aparece el título "Crear Cuenta"

### 4.2 Verificar Sección de Roles
- [ ] Aparece la etiqueta "Tipo de cuenta"
- [ ] Aparecen 4 opciones en grid 2x2:
  - [ ] **estudiante** - "Proponer y gestionar proyectos de titulación"
  - [ ] **docente** - "Asesorar estudiantes y revisar proyectos"
  - [ ] **comite** - "Supervisar el proceso y asignar revisores"
  - [ ] **biblioteca** - "Validar formato y archivar documentos"
- [ ] Cada opción es una tarjeta clickeable
- [ ] Al hacer hover, cambia el estilo del borde

### 4.3 Seleccionar Rol
- [ ] Hacer clic en una opción de rol
- [ ] La tarjeta se marca con:
  - Borde azul (indigo-600)
  - Fondo azul claro (indigo-50)
  - Icono de check (✓) en la esquina superior derecha
- [ ] Solo una opción puede estar seleccionada a la vez
- [ ] Cambiar de rol funciona correctamente

### 4.4 Verificar Campos del Formulario
- [ ] Campo "Nombre" presente
- [ ] Campo "Apellido" presente
- [ ] Campo "Correo electrónico" presente con ícono de sobre
- [ ] Campo "Matrícula" aparece cuando se selecciona "estudiante"
- [ ] Campo "Número de empleado" aparece cuando se selecciona otro rol
- [ ] Campo "Teléfono (opcional)" presente con ícono de teléfono
- [ ] Campo "Contraseña" presente con ícono de candado
- [ ] Campo "Confirmar contraseña" presente con ícono de candado
- [ ] Botón "Crear Cuenta" presente

### 4.5 Probar Validaciones
- [ ] Intentar enviar sin seleccionar rol → Muestra error "Debes seleccionar un rol"
- [ ] Intentar con contraseñas que no coinciden → Muestra error "Las contraseñas no coinciden"
- [ ] Intentar con contraseña corta (<8 chars) → Muestra error "La contraseña debe tener al menos 8 caracteres"
- [ ] Campos requeridos vacíos → Validación HTML impide envío

### 4.6 Registro Exitoso

Completar formulario con datos válidos:
```
Rol: Estudiante
Nombre: Juan
Apellido: Pérez
Email: juan.perez@ejemplo.com
Matrícula: 20201234
Teléfono: 1234567890 (opcional)
Contraseña: password123
Confirmar: password123
```

- [ ] Hacer clic en "Crear Cuenta"
- [ ] El botón muestra "Creando cuenta..." con spinner
- [ ] No aparecen errores
- [ ] Redirige al dashboard (o muestra mensaje de éxito)

### 4.7 Verificar en Base de Datos

En Supabase:
1. Ir a Table Editor
2. Abrir tabla `users`
- [ ] Aparece el usuario recién registrado
- [ ] Email es correcto
- [ ] `first_name` es "Juan"
- [ ] `last_name` es "Pérez"
- [ ] `role_id` es 1 (estudiante)
- [ ] `student_id` es "20201234"
- [ ] `password` está hasheado (no es texto plano)
- [ ] `is_active` es true
- [ ] `created_at` tiene fecha actual

## 5. Verificación de Inicio de Sesión

### 5.1 Cerrar Sesión (si está abierta)
- [ ] Buscar opción de cerrar sesión en navbar
- [ ] Hacer clic en cerrar sesión
- [ ] Redirige a página de login

### 5.2 Iniciar Sesión
```
Email: juan.perez@ejemplo.com
Contraseña: password123
```
- [ ] Hacer clic en "Iniciar Sesión"
- [ ] No aparecen errores
- [ ] Redirige al dashboard
- [ ] Muestra nombre del usuario
- [ ] Muestra rol del usuario

## 6. Pruebas de Roles Diferentes

### 6.1 Registrar Docente
```
Rol: Docente
Email: maria.garcia@ejemplo.com
Número de empleado: EMP001
```
- [ ] Registro exitoso
- [ ] Puede iniciar sesión
- [ ] Dashboard muestra rol "docente"

### 6.2 Registrar Comité
```
Rol: Comité
Email: admin@ejemplo.com
Número de empleado: COM001
```
- [ ] Registro exitoso
- [ ] Puede iniciar sesión
- [ ] Dashboard muestra rol "comite"

### 6.3 Registrar Biblioteca
```
Rol: Biblioteca
Email: biblioteca@ejemplo.com
Número de empleado: BIB001
```
- [ ] Registro exitoso
- [ ] Puede iniciar sesión
- [ ] Dashboard muestra rol "biblioteca"

## 7. Verificación de Consola del Navegador

Abrir DevTools (F12) → Console:
- [ ] No hay errores en rojo
- [ ] No hay warnings críticos
- [ ] Peticiones a API responden con 200 OK
- [ ] No hay errores de CORS

## 8. Verificación de Red (Network)

En DevTools → Network:
### Al cargar página de registro:
- [ ] `GET /api/auth/roles` → Status 200
- [ ] Response contiene los 4 roles

### Al enviar formulario:
- [ ] `POST /api/auth/register` → Status 201
- [ ] Request body contiene todos los datos del formulario
- [ ] Response contiene `success: true`
- [ ] Response contiene `token` (JWT)
- [ ] Response contiene datos del usuario creado

## 9. Problemas Comunes y Soluciones

### Backend no inicia
**Síntoma:** Error al ejecutar `npm start`
**Solución:**
1. Verificar que `.env` existe
2. Verificar credenciales de Supabase
3. Ejecutar `npm run setup:supabase` para diagnóstico

### No aparecen los roles
**Síntoma:** El grid de roles está vacío
**Solución:**
1. Verificar que backend está corriendo
2. Abrir consola del navegador, buscar error en la petición
3. Verificar que migraciones se ejecutaron en Supabase
4. Probar `curl http://localhost:3000/api/auth/roles`

### Error "tabla no existe"
**Síntoma:** Error 42P01 en backend
**Solución:**
1. Las migraciones no se ejecutaron
2. Ir a Supabase → SQL Editor
3. Ejecutar migraciones manualmente

### Error de CORS
**Síntoma:** Error de CORS en consola del navegador
**Solución:**
1. Verificar `FRONTEND_URL` en backend/.env es `http://localhost:5173`
2. Reiniciar backend después de cambiar .env

## 10. Resumen de Éxito ✅

Si todos estos puntos están verificados:
- ✅ Backend conectado a Supabase
- ✅ Tablas creadas correctamente
- ✅ 4 roles disponibles
- ✅ Frontend carga sin errores
- ✅ Página de registro muestra 4 opciones de rol
- ✅ Se puede seleccionar un rol (aparece con borde azul y check)
- ✅ El registro funciona y crea usuarios en la base de datos
- ✅ El inicio de sesión funciona
- ✅ Los 4 tipos de roles funcionan

**¡El sistema está funcionando correctamente! 🎉**

---

## Notas Adicionales

### Sobre el "Checkbox"
El reporte original mencionaba "no hay check box". Es importante clarificar:
- El frontend **NO usa checkboxes**
- Usa **radio buttons** con estilo personalizado
- Esto es correcto: solo se puede seleccionar UN rol
- El checkbox visual (✓) es solo un indicador de selección
- El problema real era que los roles no se podían cargar por falta de configuración de BD

### Arquitectura
- Frontend: React + Vite + TailwindCSS
- Backend: Node.js + Express
- Base de Datos: Supabase (PostgreSQL)
- Autenticación: JWT + bcrypt
