const { supabase } = require('../config/database');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// Constants
const ERROR_NOT_FOUND = 'PGRST116'; // Supabase error code for "not found"
const TABLE_USERS = 'users';
const TABLE_ROLES = 'roles';

class User {
  /**
   * Find user by ID
   */
  static async findById(id) {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        roles (
          name,
          description
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    
    // Flatten the structure to match the old format
    if (data && data.roles) {
      data.role_name = data.roles.name;
      data.role_description = data.roles.description;
    }
    
    return data;
  }

  /**
   * Find user by UUID
   */
  static async findByUuid(uuid) {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        roles (
          name,
          description
        )
      `)
      .eq('uuid', uuid)
      .single();
    
    if (error) {
      if (error.code === ERROR_NOT_FOUND) return null;
      throw error;
    }
    
    // Flatten the structure
    if (data && data.roles) {
      data.role_name = data.roles.name;
      data.role_description = data.roles.description;
    }
    
    return data;
  }

  /**
   * Find user by email
   */
  static async findByEmail(email) {
    const { data, error } = await supabase
      .from(TABLE_USERS)
      .select(`
        *,
        ${TABLE_ROLES} (
          name,
          description
        )
      `)
      .eq('email', email.toLowerCase())
      .single();
    
    if (error) {
      if (error.code === ERROR_NOT_FOUND) return null;
      throw error;
    }
    
    // Flatten the structure
    if (data && data.roles) {
      data.role_name = data.roles.name;
      data.role_description = data.roles.description;
    }
    
    return data;
  }

  /**
   * Create new user
   */
  static async create(userData) {
    const uuid = uuidv4();
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    
    const { data, error } = await supabase
      .from('users')
      .insert({
        uuid,
        email: userData.email.toLowerCase(),
        password: hashedPassword,
        first_name: userData.firstName,
        last_name: userData.lastName,
        role_id: userData.roleId,
        student_id: userData.studentId || null,
        employee_id: userData.employeeId || null,
        phone: userData.phone || null,
      })
      .select(`
        *,
        roles (
          name,
          description
        )
      `)
      .single();
    
    if (error) throw error;
    
    // Flatten the structure
    if (data && data.roles) {
      data.role_name = data.roles.name;
      data.role_description = data.roles.description;
    }
    
    return data;
  }

  /**
   * Update user
   */
  static async update(id, updateData) {
    const allowedFields = ['first_name', 'last_name', 'phone', 'is_active', 'email_verified'];
    const updates = {};
    
    // Convert camelCase to snake_case and filter allowed fields
    for (const [key, value] of Object.entries(updateData)) {
      const dbField = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      if (allowedFields.includes(dbField)) {
        updates[dbField] = value;
      }
    }
    
    if (Object.keys(updates).length === 0) {
      return this.findById(id);
    }
    
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        roles (
          name,
          description
        )
      `)
      .single();
    
    if (error) throw error;
    
    // Flatten the structure
    if (data && data.roles) {
      data.role_name = data.roles.name;
      data.role_description = data.roles.description;
    }
    
    return data;
  }

  /**
   * Update password
   */
  static async updatePassword(id, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    const { error } = await supabase
      .from('users')
      .update({ password: hashedPassword })
      .eq('id', id);
    
    if (error) throw error;
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
    const { error } = await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }

  /**
   * Get all users with filters
   */
  static async findAll(filters = {}) {
    let query = supabase
      .from(TABLE_USERS)
      .select(`
        id,
        uuid,
        email,
        first_name,
        last_name,
        role_id,
        is_active,
        created_at,
        ${TABLE_ROLES} (
          name
        )
      `);

    if (filters.roleId) {
      query = query.eq('role_id', filters.roleId);
    }

    if (filters.isActive !== undefined) {
      query = query.eq('is_active', filters.isActive);
    }

    if (filters.search) {
      // Escape % and _ characters to prevent pattern injection
      const escapedSearch = filters.search.replace(/[%_]/g, '\\$&');
      const searchPattern = `%${escapedSearch}%`;
      query = query.or(`first_name.ilike.${searchPattern},last_name.ilike.${searchPattern},email.ilike.${searchPattern}`);
    }

    query = query.order('created_at', { ascending: false });

    const limit = filters.limit ? Math.min(Math.max(parseInt(filters.limit, 10), 1), 1000) : 10;
    const offset = filters.offset ? Math.max(parseInt(filters.offset, 10), 0) : 0;

    if (filters.limit) {
      query = query.limit(limit);
    }

    if (filters.offset) {
      // Use safe bounds-checked values
      const endRange = Math.min(offset + limit - 1, Number.MAX_SAFE_INTEGER);
      query = query.range(offset, endRange);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    
    // Flatten the structure
    return data.map(user => ({
      ...user,
      role_name: user.roles?.name || null,
    }));
  }

  /**
   * Get all roles
   */
  static async getRoles() {
    const { data, error } = await supabase
      .from(TABLE_ROLES)
      .select('*')
      .order('id');
    
    if (error) throw error;
    return data || [];
  }

  /**
   * Get role by name
   */
  static async getRoleByName(name) {
    const { data, error } = await supabase
      .from(TABLE_ROLES)
      .select('*')
      .eq('name', name)
      .single();
    
    if (error) {
      if (error.code === ERROR_NOT_FOUND) return null;
      throw error;
    }
    
    return data;
  }
}

module.exports = User;
