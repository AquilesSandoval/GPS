/**
 * SGPTI - Migration Runner
 * Ejecuta las migraciones de base de datos en orden
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  multipleStatements: true,
};

const dbName = process.env.DB_NAME || 'sgpti_db';

async function run() {
  let connection;
  
  try {
    console.log('🚀 Iniciando migraciones de SGPTI...\n');
    
    // Connect without database first
    connection = await mysql.createConnection(config);
    
    // Create database if not exists
    console.log(`📦 Creando base de datos "${dbName}" si no existe...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await connection.query(`USE \`${dbName}\``);
    console.log(`✅ Base de datos "${dbName}" lista\n`);
    
    // Get migration files
    const migrationsDir = path.join(__dirname);
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();
    
    console.log(`📋 Encontradas ${files.length} migraciones:\n`);
    
    // Create migrations tracking table if not exists
    await connection.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Get executed migrations
    const [executedRows] = await connection.query('SELECT name FROM migrations');
    const executed = new Set(executedRows.map(r => r.name));
    
    // Run pending migrations
    let migratedCount = 0;
    
    for (const file of files) {
      if (executed.has(file)) {
        console.log(`⏭️  ${file} (ya ejecutada)`);
        continue;
      }
      
      console.log(`▶️  Ejecutando: ${file}`);
      
      const sqlPath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(sqlPath, 'utf8');
      
      try {
        await connection.query(sql);
        await connection.query('INSERT INTO migrations (name) VALUES (?)', [file]);
        console.log(`✅ ${file} completada`);
        migratedCount++;
      } catch (error) {
        console.error(`❌ Error en ${file}:`, error.message);
        throw error;
      }
    }
    
    console.log(`\n🎉 Migraciones completadas. ${migratedCount} nuevas migraciones ejecutadas.`);
    
  } catch (error) {
    console.error('\n❌ Error durante las migraciones:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

run();
