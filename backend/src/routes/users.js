const express = require('express');
const { param } = require('express-validator');
const { validate } = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const userController = require('../controllers/userController');

const router = express.Router();

/**
 * @route GET /api/users
 * @desc Get all users
 * @access Private (Comité)
 */
router.get(
  '/',
  authenticate,
  authorize('comite'),
  userController.getUsers,
);

/**
 * @route GET /api/users/role/:roleName
 * @desc Get users by role
 * @access Private (Comité)
 */
router.get(
  '/role/:roleName',
  authenticate,
  authorize('comite'),
  [
    param('roleName')
      .isIn(['estudiante', 'docente', 'comite', 'biblioteca'])
      .withMessage('Nombre de rol inválido'),
    validate,
  ],
  userController.getUsersByRole,
);

/**
 * @route GET /api/users/:uuid
 * @desc Get user by UUID
 * @access Private (Comité)
 */
router.get(
  '/:uuid',
  authenticate,
  authorize('comite'),
  [
    param('uuid')
      .isUUID()
      .withMessage('UUID inválido'),
    validate,
  ],
  userController.getUser,
);

/**
 * @route PUT /api/users/:uuid/deactivate
 * @desc Deactivate user
 * @access Private (Comité)
 */
router.put(
  '/:uuid/deactivate',
  authenticate,
  authorize('comite'),
  [
    param('uuid')
      .isUUID()
      .withMessage('UUID inválido'),
    validate,
  ],
  userController.deactivateUser,
);

/**
 * @route PUT /api/users/:uuid/activate
 * @desc Activate user
 * @access Private (Comité)
 */
router.put(
  '/:uuid/activate',
  authenticate,
  authorize('comite'),
  [
    param('uuid')
      .isUUID()
      .withMessage('UUID inválido'),
    validate,
  ],
  userController.activateUser,
);

module.exports = router;
