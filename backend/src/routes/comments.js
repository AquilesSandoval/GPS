const express = require('express');
const { body, param } = require('express-validator');
const { validate } = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const commentController = require('../controllers/commentController');

const router = express.Router();

/**
 * @route POST /api/comments
 * @desc Create comment
 * @access Private
 */
router.post(
  '/',
  authenticate,
  [
    body('projectUuid')
      .isUUID()
      .withMessage('UUID de proyecto inválido'),
    body('content')
      .trim()
      .notEmpty()
      .withMessage('El contenido del comentario es requerido'),
    body('documentId')
      .optional()
      .isInt({ min: 1 })
      .withMessage('ID de documento inválido'),
    body('parentId')
      .optional()
      .isInt({ min: 1 })
      .withMessage('ID de comentario padre inválido'),
    body('commentType')
      .optional()
      .isIn(['general', 'revision', 'correccion', 'aprobacion'])
      .withMessage('Tipo de comentario inválido'),
    body('pageNumber')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Número de página inválido'),
    validate,
  ],
  commentController.createComment,
);

/**
 * @route GET /api/comments/project/:projectUuid
 * @desc Get comments by project
 * @access Private
 */
router.get(
  '/project/:projectUuid',
  authenticate,
  [
    param('projectUuid')
      .isUUID()
      .withMessage('UUID de proyecto inválido'),
    validate,
  ],
  commentController.getProjectComments,
);

/**
 * @route PUT /api/comments/:id
 * @desc Update comment
 * @access Private (Author only)
 */
router.put(
  '/:id',
  authenticate,
  [
    param('id')
      .isInt({ min: 1 })
      .withMessage('ID de comentario inválido'),
    body('content')
      .trim()
      .notEmpty()
      .withMessage('El contenido del comentario es requerido'),
    validate,
  ],
  commentController.updateComment,
);

/**
 * @route DELETE /api/comments/:id
 * @desc Delete comment
 * @access Private (Author, Comité)
 */
router.delete(
  '/:id',
  authenticate,
  [
    param('id')
      .isInt({ min: 1 })
      .withMessage('ID de comentario inválido'),
    validate,
  ],
  commentController.deleteComment,
);

/**
 * @route PUT /api/comments/:id/resolve
 * @desc Mark comment as resolved
 * @access Private
 */
router.put(
  '/:id/resolve',
  authenticate,
  [
    param('id')
      .isInt({ min: 1 })
      .withMessage('ID de comentario inválido'),
    validate,
  ],
  commentController.resolveComment,
);

/**
 * @route PUT /api/comments/:id/unresolve
 * @desc Mark comment as unresolved
 * @access Private
 */
router.put(
  '/:id/unresolve',
  authenticate,
  [
    param('id')
      .isInt({ min: 1 })
      .withMessage('ID de comentario inválido'),
    validate,
  ],
  commentController.unresolveComment,
);

module.exports = router;
