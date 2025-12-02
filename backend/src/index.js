require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const config = require('./config');
const routes = require('./routes');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { testConnection } = require('./config/database');
const emailService = require('./services/emailService');

const app = express();

// CORS configuration
app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
