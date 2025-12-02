const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs').promises;
const config = require('../config');

class Document {
  /**
   * Find document by ID
   */
  static async findById(id) {
    const sql = `
      SELECT d.*, ds.name as stage_name, 
             u.first_name as uploader_first_name, u.last_name as uploader_last_name
      FROM project_documents d
      JOIN deliverable_stages ds ON d.stage_id = ds.id
      JOIN users u ON d.uploaded_by = u.id
      WHERE d.id = ?
    `;
    const results = await db.query(sql, [id]);
    return results[0] || null;
  }

  /**
   * Find document by UUID
   */
  static async findByUuid(uuid) {
    const sql = `
      SELECT d.*, ds.name as stage_name,
             u.first_name as uploader_first_name, u.last_name as uploader_last_name
      FROM project_documents d
      JOIN deliverable_stages ds ON d.stage_id = ds.id
      JOIN users u ON d.uploaded_by = u.id
      WHERE d.uuid = ?
    `;
    const results = await db.query(sql, [uuid]);
    return results[0] || null;
  }

  /**
   * Create new document (RF04)
   */
  static async create(documentData) {
    const uuid = uuidv4();
    
    return db.transaction(async (connection) => {
      // Get current version number
      const [versionResult] = await connection.execute(
        'SELECT MAX(version) as max_version FROM project_documents WHERE project_id = ? AND stage_id = ?',
        [documentData.projectId, documentData.stageId],
      );
      const newVersion = (versionResult[0]?.max_version || 0) + 1;
      
      // Mark previous versions as not current
      await connection.execute(
        'UPDATE project_documents SET is_current = FALSE WHERE project_id = ? AND stage_id = ?',
        [documentData.projectId, documentData.stageId],
      );
      
      // Insert new document
      const sql = `
        INSERT INTO project_documents 
        (uuid, project_id, stage_id, uploaded_by, original_name, stored_name, file_path, file_size, mime_type, version)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const [result] = await connection.execute(sql, [
        uuid,
        documentData.projectId,
        documentData.stageId,
        documentData.uploadedBy,
        documentData.originalName,
        documentData.storedName,
        documentData.filePath,
        documentData.fileSize,
        documentData.mimeType,
        newVersion,
      ]);
      
      return { id: result.insertId, uuid, version: newVersion };
    });
  }

  /**
   * Get documents by project
   */
  static async findByProject(projectId, stageId = null) {
    let sql = `
      SELECT d.*, ds.name as stage_name,
             u.first_name as uploader_first_name, u.last_name as uploader_last_name
      FROM project_documents d
      JOIN deliverable_stages ds ON d.stage_id = ds.id
      JOIN users u ON d.uploaded_by = u.id
      WHERE d.project_id = ?
    `;
    const params = [projectId];

    if (stageId) {
      sql += ' AND d.stage_id = ?';
      params.push(stageId);
    }

    sql += ' ORDER BY ds.sort_order ASC, d.version DESC';
    
    return db.query(sql, params);
  }

  /**
   * Get current document for a stage
   */
  static async getCurrentByStage(projectId, stageId) {
    const sql = `
      SELECT d.*, ds.name as stage_name,
             u.first_name as uploader_first_name, u.last_name as uploader_last_name
      FROM project_documents d
      JOIN deliverable_stages ds ON d.stage_id = ds.id
      JOIN users u ON d.uploaded_by = u.id
      WHERE d.project_id = ? AND d.stage_id = ? AND d.is_current = TRUE
    `;
    const results = await db.query(sql, [projectId, stageId]);
    return results[0] || null;
  }

  /**
   * Delete document
   */
  static async delete(id) {
    const doc = await this.findById(id);
    if (!doc) return false;
    
    // Delete file from disk
    try {
      await fs.unlink(doc.file_path);
    } catch {
      // File might not exist, continue
    }
    
    await db.query('DELETE FROM project_documents WHERE id = ?', [id]);
    return true;
  }

  /**
   * Get all deliverable stages
   */
  static async getStages() {
    return db.query('SELECT * FROM deliverable_stages ORDER BY sort_order');
  }

  /**
   * Get stage by ID
   */
  static async getStageById(stageId) {
    const results = await db.query('SELECT * FROM deliverable_stages WHERE id = ?', [stageId]);
    return results[0] || null;
  }

  /**
   * Generate stored filename
   */
  static generateStoredName(originalName) {
    const ext = path.extname(originalName);
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${timestamp}-${random}${ext}`;
  }

  /**
   * Validate file type
   */
  static isValidFileType(mimetype, filename) {
    const ext = path.extname(filename).toLowerCase();
    const allowedExtensions = config.upload.allowedTypes;
    const allowedMimes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    
    return allowedExtensions.includes(ext) && allowedMimes.includes(mimetype);
  }
}

module.exports = Document;
