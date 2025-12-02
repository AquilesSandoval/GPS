const express = require('express');
const { param } = require('express-validator');
const { validate } = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const documentController = require('../controllers/documentController');

const router = express.Router();

/**
 * @route GET /api/documents/stages
 * @desc Get all deliverable stages
 * @access Public
 */
router.get('/stages', documentController.getStages);

/**
 * @route POST /api/documents/upload
 * @desc Upload document
 * @access Private (Estudiante, Comité)
 */
router.post(
  '/upload',
  authenticate,
  documentController.uploadDocument,
);

/**
 * @route GET /api/documents/:uuid
 * @desc Get document by UUID
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
  documentController.getDocument,
);

/**
 * @route GET /api/documents/:uuid/download
 * @desc Download document
 * @access Private
 */
router.get(
  '/:uuid/download',
  authenticate,
  [
    param('uuid')
      .isUUID()
      .withMessage('UUID inválido'),
    validate,
  ],
  documentController.downloadDocument,
);

/**
 * @route GET /api/documents/project/:projectUuid
 * @desc Get documents by project
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
  documentController.getProjectDocuments,
);

/**
 * @route DELETE /api/documents/:uuid
 * @desc Delete document
 * @access Private (Uploader, Comité)
 */
router.delete(
  '/:uuid',
  authenticate,
  [
    param('uuid')
      .isUUID()
      .withMessage('UUID inválido'),
    validate,
  ],
  documentController.deleteDocument,
);

module.exports = router;
