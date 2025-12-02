const express = require('express');
const { body, param } = require('express-validator');
const { validate } = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const projectController = require('../controllers/projectController');

const router = express.Router();

/**
 * @route GET /api/projects/types
 * @desc Get all project types
 * @access Public
 */
router.get('/types', projectController.getProjectTypes);

/**
 * @route GET /api/projects/statuses
 * @desc Get all project statuses
 * @access Public
 */
router.get('/statuses', projectController.getProjectStatuses);

/**
 * @route GET /api/projects/my
 * @desc Get user's projects
 * @access Private
 */
router.get('/my', authenticate, projectController.getMyProjects);

/**
 * @route GET /api/projects/search
 * @desc Search projects
 * @access Private (Comité, Biblioteca)
 */
router.get(
  '/search',
  authenticate,
  authorize('comite', 'biblioteca'),
  projectController.searchProjects,
);

/**
 * @route GET /api/projects/export
 * @desc Export projects to Excel
 * @access Private (Comité, Biblioteca)
 */
router.get(
  '/export',
  authenticate,
  authorize('comite', 'biblioteca'),
  projectController.exportToExcel,
);

/**
 * @route POST /api/projects
 * @desc Create new project
 * @access Private (Estudiante)
 */
router.post(
  '/',
  authenticate,
  authorize('estudiante'),
  [
    body('title')
      .trim()
      .notEmpty()
      .withMessage('El título es requerido')
      .isLength({ max: 500 })
      .withMessage('El título no puede exceder 500 caracteres'),
    body('abstract')
      .optional()
      .trim(),
    body('keywords')
      .optional()
      .trim(),
    body('typeId')
      .isInt({ min: 1 })
      .withMessage('El tipo de proyecto es requerido'),
    validate,
  ],
  projectController.createProject,
);

/**
 * @route GET /api/projects/:uuid
 * @desc Get project by UUID
 * @access Private
 */
router.get(
  '/:uuid',
  authenticate,
  [
    param('uuid')
      .isUUID()
      .withMessage('UUID inválido'),
    validate,
  ],
  projectController.getProject,
);

/**
 * @route PUT /api/projects/:uuid
 * @desc Update project
 * @access Private (Author, Comité)
 */
router.put(
  '/:uuid',
  authenticate,
  [
    param('uuid')
      .isUUID()
      .withMessage('UUID inválido'),
    body('title')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('El título no puede estar vacío')
      .isLength({ max: 500 })
      .withMessage('El título no puede exceder 500 caracteres'),
    validate,
  ],
  projectController.updateProject,
);

/**
 * @route POST /api/projects/:uuid/submit
 * @desc Submit project for review
 * @access Private (Estudiante)
 */
router.post(
  '/:uuid/submit',
  authenticate,
  authorize('estudiante'),
  [
    param('uuid')
      .isUUID()
      .withMessage('UUID inválido'),
    validate,
  ],
  projectController.submitProject,
);

/**
 * @route PUT /api/projects/:uuid/status
 * @desc Update project status
 * @access Private (Comité, Docente)
 */
router.put(
  '/:uuid/status',
  authenticate,
  authorize('comite', 'docente'),
  [
    param('uuid')
      .isUUID()
      .withMessage('UUID inválido'),
    body('statusId')
      .isInt({ min: 1 })
      .withMessage('El estado es requerido'),
    body('reason')
      .optional()
      .trim(),
    validate,
  ],
  projectController.updateStatus,
);

/**
 * @route POST /api/projects/:uuid/reviewers
 * @desc Assign reviewer to project
 * @access Private (Comité)
 */
router.post(
  '/:uuid/reviewers',
  authenticate,
  authorize('comite'),
  [
    param('uuid')
      .isUUID()
      .withMessage('UUID inválido'),
    body('reviewerId')
      .isInt({ min: 1 })
      .withMessage('El revisor es requerido'),
    body('roleType')
      .optional()
      .isIn(['asesor', 'revisor', 'sinodal'])
      .withMessage('Tipo de rol inválido'),
    validate,
  ],
  projectController.assignReviewer,
);

/**
 * @route DELETE /api/projects/:uuid/reviewers/:reviewerId
 * @desc Remove reviewer from project
 * @access Private (Comité)
 */
router.delete(
  '/:uuid/reviewers/:reviewerId',
  authenticate,
  authorize('comite'),
  [
    param('uuid')
      .isUUID()
      .withMessage('UUID inválido'),
    param('reviewerId')
      .isInt({ min: 1 })
      .withMessage('ID de revisor inválido'),
    validate,
  ],
  projectController.removeReviewer,
);

/**
 * @route POST /api/projects/:uuid/authors
 * @desc Add author to project
 * @access Private (Estudiante, Comité)
 */
router.post(
  '/:uuid/authors',
  authenticate,
  [
    param('uuid')
      .isUUID()
      .withMessage('UUID inválido'),
    body('userId')
      .isInt({ min: 1 })
      .withMessage('El usuario es requerido'),
    body('isMainAuthor')
      .optional()
      .isBoolean()
      .withMessage('isMainAuthor debe ser booleano'),
    validate,
  ],
  projectController.addAuthor,
);

/**
 * @route DELETE /api/projects/:uuid/authors/:userId
 * @desc Remove author from project
 * @access Private (Estudiante, Comité)
 */
router.delete(
  '/:uuid/authors/:userId',
  authenticate,
  [
    param('uuid')
      .isUUID()
      .withMessage('UUID inválido'),
    param('userId')
      .isInt({ min: 1 })
      .withMessage('ID de usuario inválido'),
    validate,
  ],
  projectController.removeAuthor,
);

module.exports = router;
