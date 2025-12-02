const User = require('../models/User');

/**
 * Get all users (admin/comité only)
 */
const getUsers = async (req, res, next) => {
  try {
    const { roleId, isActive, search, page, limit } = req.query;

    const filters = {
      roleId: roleId ? parseInt(roleId, 10) : null,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
      search,
      limit: limit ? parseInt(limit, 10) : 20,
      offset: page ? (parseInt(page, 10) - 1) * (parseInt(limit, 10) || 20) : 0,
    };

    const users = await User.findAll(filters);

    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user by UUID
 */
const getUser = async (req, res, next) => {
  try {
    const { uuid } = req.params;

    const user = await User.findByUuid(uuid);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    // Remove sensitive data
    const { password: _password, ...userData } = user;

    res.json({
      success: true,
      data: userData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Deactivate user
 */
const deactivateUser = async (req, res, next) => {
  try {
    const { uuid } = req.params;

    const user = await User.findByUuid(uuid);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    await User.update(user.id, { isActive: false });

    res.json({
      success: true,
      message: 'Usuario desactivado exitosamente',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Activate user
 */
const activateUser = async (req, res, next) => {
  try {
    const { uuid } = req.params;

    const user = await User.findByUuid(uuid);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    await User.update(user.id, { isActive: true });

    res.json({
      success: true,
      message: 'Usuario activado exitosamente',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get users by role (for assignation)
 */
const getUsersByRole = async (req, res, next) => {
  try {
    const { roleName } = req.params;

    const role = await User.getRoleByName(roleName);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Rol no encontrado',
      });
    }

    const users = await User.findAll({ roleId: role.id, isActive: true });

    res.json({
      success: true,
      data: users.map(u => ({
        id: u.id,
        uuid: u.uuid,
        email: u.email,
        firstName: u.first_name,
        lastName: u.last_name,
        fullName: `${u.first_name} ${u.last_name}`,
      })),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getUser,
  deactivateUser,
  activateUser,
  getUsersByRole,
};
