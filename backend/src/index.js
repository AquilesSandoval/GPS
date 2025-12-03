require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const config = require('./config');
const routes = require('./routes');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');
const { testConnection } = require('./config/database');
const emailService = require('./services/emailService');

const app = express();

// Trust proxy (required for rate limiting behind reverse proxies)
app.set('trust proxy', 1);

// CORS configuration - allow multiple origins for Replit environment
const allowedOrigins = [
  config.frontendUrl,
  'http://localhost:5000',
  'http://localhost:5173',
  /\.replit\.dev$/
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed instanceof RegExp) {
        return allowed.test(origin);
      }
      return allowed === origin;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply rate limiting to all API routes
app.use('/api', apiLimiter);

// Create uploads directory if it doesn't exist
const uploadsDir = path.resolve(config.upload.path);
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve static files from uploads directory (for development)
if (config.nodeEnv === 'development') {
  app.use('/uploads', express.static(uploadsDir));
}

// API routes
app.use('/api', routes);

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'SGPTI - Sistema de Gestión de Proyectos de Titulación e Investigación',
    version: '1.0.0',
    documentation: '/api/health',
  });
});

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.log('\n⚠️  Base de datos no disponible.');
      console.log('   Por favor configura las credenciales en el archivo .env');
      console.log('   y ejecuta: npm run migrate\n');
    }
    
    // Initialize email service
    emailService.init();
    
    // Start listening
    app.listen(config.port, () => {
      console.log(`
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║   🎓 SGPTI - Sistema de Gestión de Proyectos de Titulación    ║
║                                                                ║
║   Servidor iniciado en: http://localhost:${config.port}               ║
║   Ambiente: ${config.nodeEnv.padEnd(46)}║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
