const express = require('express');
const { body, param } = require('express-validator');
const { validate } = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const notificationController = require('../controllers/notificationController');

const router = express.Router();

/**
 * @route GET /api/notifications
 * @desc Get user's notifications
 * @access Private
 */
router.get('/', authenticate, notificationController.getNotifications);

/**
 * @route GET /api/notifications/unread-count
 * @desc Get unread notification count
 * @access Private
 */
router.get('/unread-count', authenticate, notificationController.getUnreadCount);

/**
 * @route PUT /api/notifications/:id/read
 * @desc Mark notification as read
 * @access Private
 */
router.put(
  '/:id/read',
  authenticate,
  [
    param('id')
      .isInt({ min: 1 })
      .withMessage('ID de notificación inválido'),
    validate,
  ],
  notificationController.markAsRead,
);

/**
 * @route PUT /api/notifications/read-all
 * @desc Mark all notifications as read
 * @access Private
 */
router.put('/read-all', authenticate, notificationController.markAllAsRead);

/**
 * @route GET /api/notifications/preferences
 * @desc Get notification preferences
 * @access Private
 */
router.get('/preferences', authenticate, notificationController.getPreferences);

/**
 * @route PUT /api/notifications/preferences
 * @desc Update notification preference
 * @access Private
 */
router.put(
  '/preferences',
  authenticate,
  [
    body('typeId')
      .isInt({ min: 1 })
      .withMessage('Tipo de notificación inválido'),
    body('emailEnabled')
      .isBoolean()
      .withMessage('emailEnabled debe ser booleano'),
    body('inAppEnabled')
      .isBoolean()
      .withMessage('inAppEnabled debe ser booleano'),
    validate,
  ],
  notificationController.updatePreference,
);

module.exports = router;
