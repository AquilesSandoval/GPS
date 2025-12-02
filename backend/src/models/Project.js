const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Project {
  /**
   * Find project by ID
   */
  static async findById(id) {
    const sql = `
      SELECT p.*, 
             pt.name as type_name,
             ps.name as status_name, ps.color as status_color
      FROM projects p
      JOIN project_types pt ON p.type_id = pt.id
      JOIN project_statuses ps ON p.status_id = ps.id
      WHERE p.id = ?
    `;
    const results = await db.query(sql, [id]);
    if (!results[0]) return null;
    
    // Get authors
    const authors = await this.getAuthors(id);
    // Get reviewers
    const reviewers = await this.getReviewers(id);
    
    return { ...results[0], authors, reviewers };
  }

  /**
   * Find project by UUID
   */
  static async findByUuid(uuid) {
    const sql = `
      SELECT p.*, 
             pt.name as type_name,
             ps.name as status_name, ps.color as status_color
      FROM projects p
      JOIN project_types pt ON p.type_id = pt.id
      JOIN project_statuses ps ON p.status_id = ps.id
      WHERE p.uuid = ?
    `;
    const results = await db.query(sql, [uuid]);
    if (!results[0]) return null;
    
    const authors = await this.getAuthors(results[0].id);
    const reviewers = await this.getReviewers(results[0].id);
    
    return { ...results[0], authors, reviewers };
  }

  /**
   * Create new project
   */
  static async create(projectData) {
    const uuid = uuidv4();
    
    return db.transaction(async (connection) => {
      const sql = `
        INSERT INTO projects (uuid, title, abstract, keywords, type_id, status_id)
        VALUES (?, ?, ?, ?, ?, 1)
      `;
      
      const [result] = await connection.execute(sql, [
        uuid,
        projectData.title,
        projectData.abstract || null,
        projectData.keywords || null,
        projectData.typeId,
      ]);
      
      const projectId = result.insertId;
      
      // Add main author
      if (projectData.authorId) {
        await connection.execute(
          'INSERT INTO project_authors (project_id, user_id, is_main_author) VALUES (?, ?, TRUE)',
          [projectId, projectData.authorId],
        );
      }
      
      // Add status history
      await connection.execute(
        'INSERT INTO project_status_history (project_id, to_status_id, changed_by, reason) VALUES (?, 1, ?, ?)',
        [projectId, projectData.authorId, 'Proyecto creado'],
      );
      
      return { id: projectId, uuid };
    });
  }

  /**
   * Update project
   */
  static async update(id, updateData) {
    const fields = [];
    const values = [];
    
    const allowedFields = ['title', 'abstract', 'keywords', 'type_id'];
    
    for (const [key, value] of Object.entries(updateData)) {
      const dbField = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      if (allowedFields.includes(dbField)) {
        fields.push(`${dbField} = ?`);
        values.push(value);
      }
    }
    
    if (fields.length === 0) return this.findById(id);
    
    values.push(id);
    const sql = `UPDATE projects SET ${fields.join(', ')} WHERE id = ?`;
    await db.query(sql, values);
    
    return this.findById(id);
  }

  /**
   * Update project status (RF06)
   */
  static async updateStatus(id, newStatusId, changedBy, reason = null) {
    return db.transaction(async (connection) => {
      // Get current status
      const [current] = await connection.execute(
        'SELECT status_id FROM projects WHERE id = ?',
        [id],
      );
      
      const fromStatusId = current[0]?.status_id;
      
      // Update status
      let updateSql = 'UPDATE projects SET status_id = ?';
      const params = [newStatusId];
      
      // Update timestamps based on status
      if (newStatusId === 2) { // postulado
        updateSql += ', submitted_at = NOW()';
      } else if (newStatusId === 5) { // aprobado
        updateSql += ', approved_at = NOW()';
      } else if (newStatusId === 7) { // archivado
        updateSql += ', archived_at = NOW()';
      }
      
      updateSql += ' WHERE id = ?';
      params.push(id);
      
      await connection.execute(updateSql, params);
      
      // Add to history
      await connection.execute(
        'INSERT INTO project_status_history (project_id, from_status_id, to_status_id, changed_by, reason) VALUES (?, ?, ?, ?, ?)',
        [id, fromStatusId, newStatusId, changedBy, reason],
      );
      
      return true;
    });
  }

  /**
   * Get project authors
   */
  static async getAuthors(projectId) {
    const sql = `
      SELECT u.id, u.uuid, u.email, u.first_name, u.last_name, pa.is_main_author, pa.added_at
      FROM project_authors pa
      JOIN users u ON pa.user_id = u.id
      WHERE pa.project_id = ?
      ORDER BY pa.is_main_author DESC, pa.added_at ASC
    `;
    return db.query(sql, [projectId]);
  }

  /**
   * Add author to project
   */
  static async addAuthor(projectId, userId, isMainAuthor = false) {
    const sql = 'INSERT INTO project_authors (project_id, user_id, is_main_author) VALUES (?, ?, ?)';
    await db.query(sql, [projectId, userId, isMainAuthor]);
    return this.getAuthors(projectId);
  }

  /**
   * Remove author from project
   */
  static async removeAuthor(projectId, userId) {
    await db.query('DELETE FROM project_authors WHERE project_id = ? AND user_id = ?', [projectId, userId]);
    return this.getAuthors(projectId);
  }

  /**
   * Get project reviewers (RF03)
   */
  static async getReviewers(projectId) {
    const sql = `
      SELECT u.id, u.uuid, u.email, u.first_name, u.last_name, 
             pr.role_type, pr.is_active, pr.assigned_at,
             assigner.first_name as assigned_by_first_name, assigner.last_name as assigned_by_last_name
      FROM project_reviewers pr
      JOIN users u ON pr.reviewer_id = u.id
      JOIN users assigner ON pr.assigned_by = assigner.id
      WHERE pr.project_id = ?
      ORDER BY pr.assigned_at ASC
    `;
    return db.query(sql, [projectId]);
  }

  /**
   * Assign reviewer to project (RF03)
   */
  static async assignReviewer(projectId, reviewerId, assignedBy, roleType = 'revisor') {
    const sql = `
      INSERT INTO project_reviewers (project_id, reviewer_id, assigned_by, role_type)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE is_active = TRUE, assigned_at = NOW()
    `;
    await db.query(sql, [projectId, reviewerId, assignedBy, roleType]);
    return this.getReviewers(projectId);
  }

  /**
   * Remove reviewer from project
   */
  static async removeReviewer(projectId, reviewerId) {
    await db.query(
      'UPDATE project_reviewers SET is_active = FALSE WHERE project_id = ? AND reviewer_id = ?',
      [projectId, reviewerId],
    );
    return this.getReviewers(projectId);
  }

  /**
   * Get status history
   */
  static async getStatusHistory(projectId) {
    const sql = `
      SELECT psh.*, 
             fs.name as from_status_name, ts.name as to_status_name,
             u.first_name, u.last_name
      FROM project_status_history psh
      LEFT JOIN project_statuses fs ON psh.from_status_id = fs.id
      JOIN project_statuses ts ON psh.to_status_id = ts.id
      JOIN users u ON psh.changed_by = u.id
      WHERE psh.project_id = ?
      ORDER BY psh.changed_at DESC
    `;
    return db.query(sql, [projectId]);
  }

  /**
   * Search projects (RF08)
   */
  static async search(filters = {}) {
    let sql = `
      SELECT DISTINCT p.id, p.uuid, p.title, p.abstract, p.keywords,
             pt.name as type_name, ps.name as status_name, ps.color as status_color,
             p.submitted_at, p.approved_at, p.created_at
      FROM projects p
      JOIN project_types pt ON p.type_id = pt.id
      JOIN project_statuses ps ON p.status_id = ps.id
      LEFT JOIN project_authors pa ON p.id = pa.project_id
      LEFT JOIN users author ON pa.user_id = author.id
      LEFT JOIN project_reviewers pr ON p.id = pr.project_id
      LEFT JOIN users reviewer ON pr.reviewer_id = reviewer.id
      WHERE 1=1
    `;
    const params = [];

    // Search by keyword in title, abstract, keywords
    if (filters.query) {
      sql += ` AND (
        p.title LIKE ? OR 
        p.abstract LIKE ? OR 
        p.keywords LIKE ? OR
        CONCAT(author.first_name, ' ', author.last_name) LIKE ?
      )`;
      const searchTerm = `%${filters.query}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    // Filter by status
    if (filters.statusId) {
      sql += ' AND p.status_id = ?';
      params.push(filters.statusId);
    }

    // Filter by type
    if (filters.typeId) {
      sql += ' AND p.type_id = ?';
      params.push(filters.typeId);
    }

    // Filter by author
    if (filters.authorId) {
      sql += ' AND pa.user_id = ?';
      params.push(filters.authorId);
    }

    // Filter by reviewer
    if (filters.reviewerId) {
      sql += ' AND pr.reviewer_id = ? AND pr.is_active = TRUE';
      params.push(filters.reviewerId);
    }

    // Filter by date range
    if (filters.fromDate) {
      sql += ' AND p.created_at >= ?';
      params.push(filters.fromDate);
    }

    if (filters.toDate) {
      sql += ' AND p.created_at <= ?';
      params.push(filters.toDate);
    }

    sql += ' ORDER BY p.created_at DESC';

    // Pagination
    if (filters.limit) {
      sql += ' LIMIT ?';
      params.push(parseInt(filters.limit, 10));
    }

    if (filters.offset) {
      sql += ' OFFSET ?';
      params.push(parseInt(filters.offset, 10));
    }

    const projects = await db.query(sql, params);
    
    // Get authors for each project
    for (const project of projects) {
      project.authors = await this.getAuthors(project.id);
    }
    
    return projects;
  }

  /**
   * Get all project types
   */
  static async getTypes() {
    return db.query('SELECT * FROM project_types ORDER BY name');
  }

  /**
   * Get all project statuses
   */
  static async getStatuses() {
    return db.query('SELECT * FROM project_statuses ORDER BY sort_order');
  }

  /**
   * Get projects by user role
   */
  static async findByUser(userId, role) {
    if (role === 'estudiante') {
      // Get projects where user is author
      return this.search({ authorId: userId });
    } else if (role === 'docente') {
      // Get projects where user is reviewer
      return this.search({ reviewerId: userId });
    } else {
      // comite and biblioteca can see all
      return this.search({});
    }
  }
}

module.exports = Project;
