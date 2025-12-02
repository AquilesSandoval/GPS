require('dotenv').config();

// Validate required environment variables in production
const validateRequiredEnvVars = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isProduction) {
    const required = ['DB_PASSWORD', 'JWT_SECRET'];
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
    
    // Validate JWT_SECRET is not the default
    if (process.env.JWT_SECRET === 'default-secret-change-in-production') {
      throw new Error('JWT_SECRET must be changed from default value in production');
    }
  }
};

validateRequiredEnvVars();

module.exports = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Supabase configuration
  supabase: {
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY,
  },

  // Database configuration (Legacy MySQL - Deprecated)
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    name: process.env.DB_NAME || 'sgpti_db',
    connectionLimit: 10,
  },
  
  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || (process.env.NODE_ENV === 'development' ? 'dev-secret-not-for-production' : undefined),
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
  
  // Email configuration
  email: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD,
    from: process.env.EMAIL_FROM || 'SGPTI <noreply@sgpti.edu>',
  },
  
  // File upload configuration
  upload: {
    maxSize: parseInt(process.env.UPLOAD_MAX_SIZE, 10) || 20 * 1024 * 1024, // 20MB
    path: process.env.UPLOAD_PATH || './uploads',
    allowedTypes: (process.env.ALLOWED_FILE_TYPES || '.pdf,.doc,.docx').split(','),
  },
  
  // Frontend URL for CORS
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
};
