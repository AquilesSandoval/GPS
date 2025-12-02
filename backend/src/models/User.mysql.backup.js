const db = require('../config/database');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

class User {
  /**
   * Find user by ID
   */
  static async findById(id) {
    const sql = `
      SELECT u.*, r.name as role_name, r.description as role_description
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = ?
    `;
    const results = await db.query(sql, [id]);
    return results[0] || null;
  }

  /**
   * Find user by UUID
   */
  static async findByUuid(uuid) {
    const sql = `
      SELECT u.*, r.name as role_name, r.description as role_description
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.uuid = ?
    `;
    const results = await db.query(sql, [uuid]);
    return results[0] || null;
  }

  /**
   * Find user by email
   */
  static async findByEmail(email) {
    const sql = `
      SELECT u.*, r.name as role_name, r.description as role_description
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.email = ?
    `;
    const results = await db.query(sql, [email.toLowerCase()]);
    return results[0] || null;
  }

  /**
   * Create new user
   */
  static async create(userData) {
    const uuid = uuidv4();
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    
    const sql = `
      INSERT INTO users (uuid, email, password, first_name, last_name, role_id, student_id, employee_id, phone)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const result = await db.query(sql, [
      uuid,
      userData.email.toLowerCase(),
      hashedPassword,
      userData.firstName,
      userData.lastName,
      userData.roleId,
      userData.studentId || null,
      userData.employeeId || null,
      userData.phone || null,
    ]);
    
    return this.findById(result.insertId);
  }

  /**
   * Update user
   */
  static async update(id, updateData) {
    const fields = [];
    const values = [];
    
    const allowedFields = ['first_name', 'last_name', 'phone', 'is_active', 'email_verified'];
    
    for (const [key, value] of Object.entries(updateData)) {
      const dbField = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      if (allowedFields.includes(dbField)) {
        fields.push(`${dbField} = ?`);
        values.push(value);
      }
    }
    
    if (fields.length === 0) return this.findById(id);
    
    values.push(id);
    const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
    await db.query(sql, values);
    
    return this.findById(id);
  }

  /**
   * Update password
   */
  static async updatePassword(id, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, id]);
    return true;
  }

  /**
   * Verify password
   */
  static async verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Update last login
   */
  static async updateLastLogin(id) {
    await db.query('UPDATE users SET last_login = NOW() WHERE id = ?', [id]);
  }

  /**
   * Get all users with filters
   */
  static async findAll(filters = {}) {
    let sql = `
      SELECT u.id, u.uuid, u.email, u.first_name, u.last_name, u.role_id,
             r.name as role_name, u.is_active, u.created_at
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.roleId) {
      sql += ' AND u.role_id = ?';
      params.push(filters.roleId);
    }

    if (filters.isActive !== undefined) {
      sql += ' AND u.is_active = ?';
      params.push(filters.isActive);
    }

    if (filters.search) {
      sql += ' AND (u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    sql += ' ORDER BY u.created_at DESC';

    if (filters.limit) {
      sql += ' LIMIT ?';
      params.push(parseInt(filters.limit, 10));
    }

    if (filters.offset) {
      sql += ' OFFSET ?';
      params.push(parseInt(filters.offset, 10));
    }

    return db.query(sql, params);
  }

  /**
   * Get all roles
   */
  static async getRoles() {
    return db.query('SELECT * FROM roles ORDER BY id');
  }

  /**
   * Get role by name
   */
  static async getRoleByName(name) {
    const results = await db.query('SELECT * FROM roles WHERE name = ?', [name]);
    return results[0] || null;
  }
}

module.exports = User;
