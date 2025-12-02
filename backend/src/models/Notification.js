const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Notification {
  /**
   * Find notification by ID
   */
  static async findById(id) {
    const sql = `
      SELECT n.*, nt.code as type_code, nt.name as type_name
      FROM notifications n
      JOIN notification_types nt ON n.type_id = nt.id
      WHERE n.id = ?
    `;
    const results = await db.query(sql, [id]);
    return results[0] || null;
  }

  /**
   * Create new notification (RF07)
   */
  static async create(notificationData) {
    const uuid = uuidv4();
    
    const sql = `
      INSERT INTO notifications 
      (uuid, user_id, type_id, project_id, title, message, data)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const result = await db.query(sql, [
      uuid,
      notificationData.userId,
      notificationData.typeId,
      notificationData.projectId || null,
      notificationData.title,
      notificationData.message,
      notificationData.data ? JSON.stringify(notificationData.data) : null,
    ]);
    
    return this.findById(result.insertId);
  }

  /**
   * Get notifications for user
   */
  static async findByUser(userId, filters = {}) {
    let sql = `
      SELECT n.*, nt.code as type_code, nt.name as type_name,
             p.title as project_title
      FROM notifications n
      JOIN notification_types nt ON n.type_id = nt.id
      LEFT JOIN projects p ON n.project_id = p.id
      WHERE n.user_id = ?
    `;
    const params = [userId];

    if (filters.isRead !== undefined) {
      sql += ' AND n.is_read = ?';
      params.push(filters.isRead);
    }

    sql += ' ORDER BY n.created_at DESC';

    if (filters.limit) {
      sql += ' LIMIT ?';
      params.push(parseInt(filters.limit, 10));
    }

    return db.query(sql, params);
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(id) {
    await db.query(
      'UPDATE notifications SET is_read = TRUE, read_at = NOW() WHERE id = ?',
      [id],
    );
    return this.findById(id);
  }

  /**
   * Mark all notifications as read for user
   */
  static async markAllAsRead(userId) {
    await db.query(
      'UPDATE notifications SET is_read = TRUE, read_at = NOW() WHERE user_id = ? AND is_read = FALSE',
      [userId],
    );
    return true;
  }

  /**
   * Count unread notifications
   */
  static async countUnread(userId) {
    const sql = 'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE';
    const results = await db.query(sql, [userId]);
    return results[0].count;
  }

  /**
   * Mark email as sent
   */
  static async markEmailSent(id) {
    await db.query(
      'UPDATE notifications SET email_sent = TRUE, email_sent_at = NOW() WHERE id = ?',
      [id],
    );
  }

  /**
   * Get notification types
   */
  static async getTypes() {
    return db.query('SELECT * FROM notification_types ORDER BY id');
  }

  /**
   * Get notification type by code
   */
  static async getTypeByCode(code) {
    const results = await db.query('SELECT * FROM notification_types WHERE code = ?', [code]);
    return results[0] || null;
  }

  /**
   * Delete old notifications (cleanup job)
   */
  static async deleteOld(daysOld = 90) {
    await db.query(
      'DELETE FROM notifications WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY) AND is_read = TRUE',
      [daysOld],
    );
  }

  /**
   * Get user notification preferences
   */
  static async getPreferences(userId) {
    const sql = `
      SELECT np.*, nt.code as type_code, nt.name as type_name
      FROM notification_types nt
      LEFT JOIN notification_preferences np ON nt.id = np.type_id AND np.user_id = ?
    `;
    return db.query(sql, [userId]);
  }

  /**
   * Update notification preference
   */
  static async updatePreference(userId, typeId, emailEnabled, inAppEnabled) {
    const sql = `
      INSERT INTO notification_preferences (user_id, type_id, email_enabled, in_app_enabled)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE email_enabled = ?, in_app_enabled = ?
    `;
    await db.query(sql, [userId, typeId, emailEnabled, inAppEnabled, emailEnabled, inAppEnabled]);
    return true;
  }
}

module.exports = Notification;
