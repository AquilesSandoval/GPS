const express = require('express');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const authController = require('../controllers/authController');

const router = express.Router();

/**
 * @route POST /api/auth/register
 * @desc Register new user
 * @access Public
 */
router.post(
  '/register',
  [
    body('email')
      .isEmail()
      .withMessage('Correo electrónico inválido')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 8 })
      .withMessage('La contraseña debe tener al menos 8 caracteres'),
    body('firstName')
      .trim()
      .notEmpty()
      .withMessage('El nombre es requerido'),
    body('lastName')
      .trim()
      .notEmpty()
      .withMessage('El apellido es requerido'),
    body('roleId')
      .isInt({ min: 1 })
      .withMessage('El rol es requerido'),
    validate,
  ],
  authController.register,
);

/**
 * @route POST /api/auth/login
 * @desc Login user
 * @access Public
 */
router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .withMessage('Correo electrónico inválido')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('La contraseña es requerida'),
    validate,
  ],
  authController.login,
);

/**
 * @route GET /api/auth/profile
 * @desc Get current user profile
 * @access Private
 */
router.get('/profile', authenticate, authController.getProfile);

/**
 * @route PUT /api/auth/profile
 * @desc Update user profile
 * @access Private
 */
router.put(
  '/profile',
  authenticate,
  [
    body('firstName')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('El nombre no puede estar vacío'),
    body('lastName')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('El apellido no puede estar vacío'),
    validate,
  ],
  authController.updateProfile,
);

/**
 * @route PUT /api/auth/password
 * @desc Change password
 * @access Private
 */
router.put(
  '/password',
  authenticate,
  [
    body('currentPassword')
      .notEmpty()
      .withMessage('La contraseña actual es requerida'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('La nueva contraseña debe tener al menos 8 caracteres'),
    validate,
  ],
  authController.changePassword,
);

/**
 * @route GET /api/auth/roles
 * @desc Get all roles
 * @access Public
 */
router.get('/roles', authController.getRoles);

module.exports = router;
