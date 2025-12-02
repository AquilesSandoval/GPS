# 🎓 SGPTI - Sistema de Gestión de Proyectos de Titulación e Investigación

Sistema web para la gestión integral de proyectos académicos de titulación e investigación.

## 📋 Características

### Módulos Implementados

- **RF01 - Gestión de Cuentas**: Registro y autenticación para 4 roles (Estudiante, Docente, Comité, Biblioteca)
- **RF02 - Postulación de Proyectos**: Crear, editar y enviar propuestas de proyecto
- **RF03 - Asignación de Revisores**: El Comité asigna docentes/asesores a proyectos
- **RF04 - Carga de Entregables**: Subida de documentos (PDF, DOC, DOCX) por etapas
- **RF05 - Revisión y Comentarios**: Sistema de retroalimentación entre revisores y estudiantes
- **RF06 - Flujo de Aprobación**: Gestión de estados (Borrador → Postulado → En Revisión → Aprobado/Rechazado → Archivado)
- **RF07 - Notificaciones Automatizadas**: Alertas por email y en sistema
- **RF08 - Búsqueda y Filtrado**: Búsqueda avanzada de proyectos

## 🚀 Instalación

### Prerrequisitos

- Node.js v18 o superior
- MySQL 8.0 o superior
- npm o yarn

### Pasos de instalación

1. **Clonar el repositorio**
   ```bash
   git clone <url-del-repositorio>
   cd GPS/backend
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   ```
   
   Edita el archivo `.env` con tus credenciales:
   ```env
   # Base de datos
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=tu_usuario
   DB_PASSWORD=tu_contraseña
   DB_NAME=sgpti_db
   
   # JWT
   JWT_SECRET=tu_clave_secreta_muy_segura
   
   # Email (opcional pero recomendado)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=tu_correo@gmail.com
   SMTP_PASSWORD=tu_contraseña_de_aplicacion
   ```

4. **Ejecutar migraciones**
   ```bash
   npm run migrate
   ```

5. **Iniciar el servidor**
   ```bash
   # Desarrollo
   npm run dev
   
   # Producción
   npm start
   ```

El servidor estará disponible en `http://localhost:3000`

## 📚 API Endpoints

### Autenticación (`/api/auth`)

| Método | Endpoint | Descripción | Acceso |
|--------|----------|-------------|--------|
| POST | `/register` | Registrar nuevo usuario | Público |
| POST | `/login` | Iniciar sesión | Público |
| GET | `/profile` | Obtener perfil actual | Autenticado |
| PUT | `/profile` | Actualizar perfil | Autenticado |
| PUT | `/password` | Cambiar contraseña | Autenticado |
| GET | `/roles` | Obtener roles disponibles | Público |

### Proyectos (`/api/projects`)

| Método | Endpoint | Descripción | Acceso |
|--------|----------|-------------|--------|
| GET | `/types` | Obtener tipos de proyecto | Público |
| GET | `/statuses` | Obtener estados de proyecto | Público |
| GET | `/my` | Obtener mis proyectos | Autenticado |
| GET | `/search` | Buscar proyectos | Comité, Biblioteca |
| POST | `/` | Crear proyecto | Estudiante |
| GET | `/:uuid` | Obtener proyecto | Autenticado |
| PUT | `/:uuid` | Actualizar proyecto | Autor, Comité |
| POST | `/:uuid/submit` | Enviar a revisión | Estudiante |
| PUT | `/:uuid/status` | Cambiar estado | Comité, Docente |
| POST | `/:uuid/reviewers` | Asignar revisor | Comité |
| DELETE | `/:uuid/reviewers/:id` | Remover revisor | Comité |
| POST | `/:uuid/authors` | Agregar autor | Estudiante |
| DELETE | `/:uuid/authors/:id` | Remover autor | Estudiante |

### Documentos (`/api/documents`)

| Método | Endpoint | Descripción | Acceso |
|--------|----------|-------------|--------|
| GET | `/stages` | Obtener etapas de entregables | Público |
| POST | `/upload` | Subir documento | Estudiante, Comité |
| GET | `/:uuid` | Obtener documento | Autenticado |
| GET | `/:uuid/download` | Descargar documento | Autenticado |
| GET | `/project/:projectUuid` | Documentos del proyecto | Autenticado |
| DELETE | `/:uuid` | Eliminar documento | Uploader, Comité |

### Comentarios (`/api/comments`)

| Método | Endpoint | Descripción | Acceso |
|--------|----------|-------------|--------|
| POST | `/` | Crear comentario | Autenticado |
| GET | `/project/:projectUuid` | Comentarios del proyecto | Autenticado |
| PUT | `/:id` | Actualizar comentario | Autor |
| DELETE | `/:id` | Eliminar comentario | Autor, Comité |
| PUT | `/:id/resolve` | Marcar como resuelto | Autenticado |
| PUT | `/:id/unresolve` | Desmarcar resuelto | Autenticado |

### Notificaciones (`/api/notifications`)

| Método | Endpoint | Descripción | Acceso |
|--------|----------|-------------|--------|
| GET | `/` | Obtener notificaciones | Autenticado |
| GET | `/unread-count` | Contar no leídas | Autenticado |
| PUT | `/:id/read` | Marcar como leída | Autenticado |
| PUT | `/read-all` | Marcar todas leídas | Autenticado |
| GET | `/preferences` | Obtener preferencias | Autenticado |
| PUT | `/preferences` | Actualizar preferencias | Autenticado |

### Usuarios (`/api/users`)

| Método | Endpoint | Descripción | Acceso |
|--------|----------|-------------|--------|
| GET | `/` | Listar usuarios | Comité |
| GET | `/role/:roleName` | Usuarios por rol | Comité |
| GET | `/:uuid` | Obtener usuario | Comité |
| PUT | `/:uuid/deactivate` | Desactivar usuario | Comité |
| PUT | `/:uuid/activate` | Activar usuario | Comité |

## 🗄️ Estructura de Base de Datos

### Tablas principales

- `roles` - Roles del sistema
- `users` - Usuarios
- `project_types` - Tipos de proyecto
- `project_statuses` - Estados de proyecto
- `projects` - Proyectos
- `project_authors` - Autores de proyectos
- `project_reviewers` - Revisores asignados
- `deliverable_stages` - Etapas de entregables
- `project_documents` - Documentos subidos
- `project_comments` - Comentarios/retroalimentación
- `project_status_history` - Historial de estados
- `project_evaluations` - Evaluaciones de revisores
- `notification_types` - Tipos de notificación
- `notifications` - Notificaciones
- `notification_preferences` - Preferencias de usuario
- `library_archives` - Registro de archivo en biblioteca
- `tags` - Etiquetas para búsqueda
- `project_tags` - Relación proyecto-etiquetas

## 🔐 Roles del Sistema

| Rol | Descripción |
|-----|-------------|
| **Estudiante** | Crea proyectos, sube entregables, responde comentarios |
| **Docente** | Revisa proyectos asignados, agrega comentarios y evaluaciones |
| **Comité** | Administra el proceso, asigna revisores, aprueba/rechaza |
| **Biblioteca** | Valida formato final, archiva documentos aprobados |

## 📁 Estructura del Proyecto

```
backend/
├── migrations/           # Scripts de migración SQL
│   ├── 001_create_migrations_table.sql
│   ├── 002_create_users_table.sql
│   ├── 003_create_projects_table.sql
│   ├── 004_create_reviews_table.sql
│   ├── 005_create_notifications_table.sql
│   ├── 006_create_search_archive_tables.sql
│   ├── run.js           # Script para ejecutar migraciones
│   └── rollback.js      # Script para revertir migraciones
├── src/
│   ├── config/          # Configuración
│   │   ├── index.js     # Variables de configuración
│   │   └── database.js  # Conexión a MySQL
│   ├── controllers/     # Controladores
│   ├── middleware/      # Middleware (auth, validación, errores)
│   ├── models/          # Modelos de datos
│   ├── routes/          # Definición de rutas
│   ├── services/        # Servicios (email, notificaciones)
│   └── index.js         # Punto de entrada
├── uploads/             # Directorio para documentos subidos
├── .env.example         # Plantilla de variables de entorno
├── package.json
└── README.md
```

## 🔧 Scripts disponibles

```bash
# Iniciar en modo desarrollo (con hot reload)
npm run dev

# Iniciar en producción
npm start

# Ejecutar migraciones
npm run migrate

# Revertir última migración
npm run migrate:rollback

# Ejecutar tests
npm test

# Ejecutar linter
npm run lint
```

## 📧 Configuración de Email

Para habilitar notificaciones por email:

1. **Gmail**: Crear una [contraseña de aplicación](https://support.google.com/accounts/answer/185833)
2. **Otro SMTP**: Configurar las variables SMTP en `.env`

Si no se configura SMTP, los emails se mostrarán en la consola (útil para desarrollo).

## 🛡️ Seguridad

- Contraseñas hasheadas con bcrypt (12 rounds)
- Autenticación via JWT
- Validación de entrada con express-validator
- Protección CORS configurada
- Límite de tamaño de archivos (20MB)
- Solo tipos de archivo permitidos (PDF, DOC, DOCX)

## 📝 Licencia

MIT

---

**SGPTI** - Desarrollado para la gestión eficiente de proyectos académicos 🎓
