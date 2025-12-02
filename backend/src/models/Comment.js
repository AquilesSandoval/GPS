const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Comment {
  /**
   * Find comment by ID
   */
  static async findById(id) {
    const sql = `
      SELECT c.*, u.first_name, u.last_name, u.email,
             r.first_name as resolved_by_first_name, r.last_name as resolved_by_last_name
      FROM project_comments c
      JOIN users u ON c.user_id = u.id
      LEFT JOIN users r ON c.resolved_by = r.id
      WHERE c.id = ?
    `;
    const results = await db.query(sql, [id]);
    return results[0] || null;
  }

  /**
   * Create new comment (RF05)
   */
  static async create(commentData) {
    const uuid = uuidv4();
    
    const sql = `
      INSERT INTO project_comments 
      (uuid, project_id, document_id, user_id, parent_id, content, comment_type, page_number)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const result = await db.query(sql, [
      uuid,
      commentData.projectId,
      commentData.documentId || null,
      commentData.userId,
      commentData.parentId || null,
      commentData.content,
      commentData.commentType || 'general',
      commentData.pageNumber || null,
    ]);
    
    return this.findById(result.insertId);
  }

  /**
   * Get comments by project
   */
  static async findByProject(projectId, filters = {}) {
    let sql = `
      SELECT c.*, u.first_name, u.last_name, u.email,
             r.first_name as resolved_by_first_name, r.last_name as resolved_by_last_name,
             d.original_name as document_name
      FROM project_comments c
      JOIN users u ON c.user_id = u.id
      LEFT JOIN users r ON c.resolved_by = r.id
      LEFT JOIN project_documents d ON c.document_id = d.id
      WHERE c.project_id = ? AND c.parent_id IS NULL
    `;
    const params = [projectId];

    if (filters.documentId) {
      sql += ' AND c.document_id = ?';
      params.push(filters.documentId);
    }

    if (filters.isResolved !== undefined) {
      sql += ' AND c.is_resolved = ?';
      params.push(filters.isResolved);
    }

    if (filters.commentType) {
      sql += ' AND c.comment_type = ?';
      params.push(filters.commentType);
    }

    sql += ' ORDER BY c.created_at DESC';
    
    const comments = await db.query(sql, params);
    
    // Get replies for each comment
    for (const comment of comments) {
      comment.replies = await this.getReplies(comment.id);
    }
    
    return comments;
  }

  /**
   * Get replies to a comment
   */
  static async getReplies(parentId) {
    const sql = `
      SELECT c.*, u.first_name, u.last_name, u.email
      FROM project_comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.parent_id = ?
      ORDER BY c.created_at ASC
    `;
    return db.query(sql, [parentId]);
  }

  /**
   * Update comment
   */
  static async update(id, content) {
    await db.query('UPDATE project_comments SET content = ? WHERE id = ?', [content, id]);
    return this.findById(id);
  }

  /**
   * Mark comment as resolved
   */
  static async resolve(id, resolvedBy) {
    await db.query(
      'UPDATE project_comments SET is_resolved = TRUE, resolved_by = ?, resolved_at = NOW() WHERE id = ?',
      [resolvedBy, id],
    );
    return this.findById(id);
  }

  /**
   * Unresolve comment
   */
  static async unresolve(id) {
    await db.query(
      'UPDATE project_comments SET is_resolved = FALSE, resolved_by = NULL, resolved_at = NULL WHERE id = ?',
      [id],
    );
    return this.findById(id);
  }

  /**
   * Delete comment
   */
  static async delete(id) {
    await db.query('DELETE FROM project_comments WHERE id = ?', [id]);
    return true;
  }

  /**
   * Count unresolved comments for a project
   */
  static async countUnresolved(projectId) {
    const sql = 'SELECT COUNT(*) as count FROM project_comments WHERE project_id = ? AND is_resolved = FALSE';
    const results = await db.query(sql, [projectId]);
    return results[0].count;
  }
}

module.exports = Comment;
