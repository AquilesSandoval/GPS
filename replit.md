# SGPTI - Sistema de Gestión de Proyectos de Titulación e Investigación

## Overview
SGPTI is a comprehensive project management system for thesis and research projects. The application is designed to help students, advisors, committees, and library staff manage academic projects from proposal through completion.

## Project Architecture

### Technology Stack
- **Frontend**: React 19 + Vite 7 + TailwindCSS 4
- **Backend**: Express.js (Node.js) + Supabase (PostgreSQL)
- **Authentication**: JWT-based authentication
- **File Upload**: Multer for document management

### Project Structure
```
.
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable React components
│   │   ├── contexts/       # React context providers (Auth)
│   │   ├── pages/         # Page components (Login, Register, Dashboard, etc.)
│   │   └── services/      # API integration services
│   ├── vite.config.js     # Vite configuration (port 5000, proxy to backend)
│   └── package.json
│
├── backend/               # Express.js backend API
│   ├── src/
│   │   ├── config/        # Configuration (database, app settings)
│   │   ├── controllers/   # Request handlers
│   │   ├── middleware/    # Auth, validation, rate limiting
│   │   ├── models/        # Database models (Supabase)
│   │   ├── routes/        # API routes
│   │   └── services/      # Business logic (email, notifications)
│   ├── migrations/        # Database migration scripts
│   ├── seeds/            # Database seed scripts
│   └── package.json
│
├── start.sh              # Startup script (runs both frontend & backend)
└── replit.md            # This file
```

## Current State

### ✅ Completed Setup
- Node.js 20 installed
- All dependencies installed (frontend and backend)
- Vite configured for Replit environment:
  - Port 5000 (required for Replit webview)
  - Host 0.0.0.0 (allows external access)
  - allowedHosts: true (supports Replit proxy)
- Backend CORS configured for Replit domains
- Workflow configured to run both services
- Deployment settings configured
- Both servers running successfully

### ⚠️ Requires User Action
**Supabase Database Credentials Needed**

The application uses Supabase as its database. To fully activate the system, you need to provide:
1. `SUPABASE_URL` - Your Supabase project URL
2. `SUPABASE_ANON_KEY` - Your Supabase anonymous key

These should be set in `backend/.env` file.

## How to Use

### Running the Application
The application starts automatically via the configured workflow. Both frontend and backend run together:
- **Frontend**: http://localhost:5000 (Replit webview accessible)
- **Backend API**: http://localhost:3000 (internal)

To manually restart:
```bash
bash start.sh
```

### Setting Up Supabase
1. Create a Supabase account at https://supabase.com
2. Create a new project
3. Get your credentials from Settings > API
4. Update `backend/.env` with your credentials:
   ```
   SUPABASE_URL=https://your-project-ref.supabase.co
   SUPABASE_ANON_KEY=your-anon-key-here
   ```
5. Run the database migrations (see existing docs in backend/QUICK_START.md)

### User Roles
The system supports 4 user roles:
- **estudiante** (Student) - Propose and manage thesis projects
- **docente** (Advisor) - Advise students and review projects
- **comite** (Committee) - Supervise process and assign reviewers
- **biblioteca** (Library) - Validate format and archive documents

## API Endpoints
All API endpoints are prefixed with `/api`:
- `/api/auth/*` - Authentication (login, register, logout)
- `/api/users/*` - User management
- `/api/projects/*` - Project management
- `/api/documents/*` - Document upload/download
- `/api/notifications/*` - Notification system
- `/api/comments/*` - Comments on projects

## Environment Variables

### Backend (.env)
```bash
# Server
PORT=3000
NODE_ENV=development

# Supabase (REQUIRED)
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-key

# JWT Authentication
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# File uploads
UPLOAD_MAX_SIZE=20971520
UPLOAD_PATH=./uploads
ALLOWED_FILE_TYPES=.pdf,.doc,.docx

# Frontend URL (auto-configured for Replit)
FRONTEND_URL=https://33b955e6-85bf-4077-8890-2a3b21af9632-00-31ol1kfqxl3q0.picard.replit.dev
```

## Recent Changes (2024-12-03)
- Configured Vite for Replit environment (port 5000, host 0.0.0.0, allowedHosts)
- Updated backend CORS to support Replit domains and multiple origins
- Installed all Node.js dependencies
- Created unified startup script (start.sh)
- Configured deployment for autoscale
- Created comprehensive documentation

## Next Steps
1. Provide Supabase credentials in `backend/.env`
2. Run database migrations following `backend/QUICK_START.md`
3. Create test users using `npm run seed` in backend directory
4. Test login/register functionality
5. Deploy to production when ready

## Additional Documentation
- `backend/QUICK_START.md` - Quick setup guide
- `backend/SETUP_INSTRUCTIONS.md` - Detailed setup instructions
- `backend/SUPABASE_*.md` - Supabase-specific documentation
- `README_USUARIO.md` - User guide (Spanish)
- `ESTADO_FINAL.md` - Final status report (Spanish)

## Support
For issues or questions about the codebase, refer to the existing documentation files. The system includes diagnostic tools in the backend:
- `npm run check` - Verify database connection and configuration
- `npm run list:users` - List existing users in database
