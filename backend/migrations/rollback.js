/**
 * SGPTI - Migration Rollback
 * Revierte la última migración ejecutada
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
  database: process.env.DB_NAME || 'sgpti_db',
  multipleStatements: true,
};

async function rollback() {
  let connection;
  
  try {
    console.log('🔄 Iniciando rollback de SGPTI...\n');
    
    connection = await mysql.createConnection(config);
    
    // Get last migration
    const [rows] = await connection.query(
      'SELECT name FROM migrations ORDER BY id DESC LIMIT 1'
    );
    
    if (rows.length === 0) {
      console.log('ℹ️  No hay migraciones para revertir.');
      return;
    }
    
    const lastMigration = rows[0].name;
    console.log(`⚠️  Última migración: ${lastMigration}`);
    console.log('⚠️  ADVERTENCIA: Este proceso eliminará las tablas creadas por esta migración.\n');
    
    // Tables to drop based on migration
    const tablesToDrop = {
      '006_create_search_archive_tables.sql': ['search_logs', 'project_tags', 'tags', 'library_archives'],
      '005_create_notifications_table.sql': ['notification_preferences', 'notifications', 'notification_types'],
      '004_create_reviews_table.sql': ['project_evaluations', 'project_status_history', 'project_comments', 'project_reviewers'],
      '003_create_projects_table.sql': ['project_documents', 'deliverable_stages', 'project_authors', 'projects', 'project_types', 'project_statuses'],
      '002_create_users_table.sql': ['password_resets', 'users', 'roles'],
      '001_create_migrations_table.sql': [],
    };
    
    const tables = tablesToDrop[lastMigration] || [];
    
    // Drop view first if exists
    if (lastMigration === '006_create_search_archive_tables.sql') {
      await connection.query('DROP VIEW IF EXISTS v_project_search');
      console.log('🗑️  Vista v_project_search eliminada');
    }
    
    // Disable foreign key checks
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    
    for (const table of tables) {
      await connection.query(`DROP TABLE IF EXISTS \`${table}\``);
      console.log(`🗑️  Tabla ${table} eliminada`);
    }
    
    // Re-enable foreign key checks
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    
    // Remove from migrations table
    await connection.query('DELETE FROM migrations WHERE name = ?', [lastMigration]);
    console.log(`\n✅ Rollback de ${lastMigration} completado.`);
    
  } catch (error) {
    console.error('\n❌ Error durante el rollback:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

rollback();
