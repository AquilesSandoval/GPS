const Notification = require('../models/Notification');

/**
 * Get user's notifications
 */
const getNotifications = async (req, res, next) => {
  try {
    const { isRead, limit } = req.query;

    const filters = {
      isRead: isRead !== undefined ? isRead === 'true' : undefined,
      limit: limit ? parseInt(limit, 10) : 50,
    };

    const notifications = await Notification.findByUser(req.user.id, filters);

    res.json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get unread count
 */
const getUnreadCount = async (req, res, next) => {
  try {
    const count = await Notification.countUnread(req.user.id);

    res.json({
      success: true,
      data: { count },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark notification as read
 */
const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findById(id);
    if (!notification || notification.user_id !== req.user.id) {
      return res.status(404).json({
        success: false,
        message: 'Notificación no encontrada',
      });
    }

    const updatedNotification = await Notification.markAsRead(parseInt(id, 10));

    res.json({
      success: true,
      data: updatedNotification,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark all notifications as read
 */
const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.markAllAsRead(req.user.id);

    res.json({
      success: true,
      message: 'Todas las notificaciones marcadas como leídas',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get notification preferences
 */
const getPreferences = async (req, res, next) => {
  try {
    const preferences = await Notification.getPreferences(req.user.id);

    res.json({
      success: true,
      data: preferences,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update notification preference
 */
const updatePreference = async (req, res, next) => {
  try {
    const { typeId, emailEnabled, inAppEnabled } = req.body;

    await Notification.updatePreference(
      req.user.id,
      typeId,
      emailEnabled,
      inAppEnabled,
    );

    res.json({
      success: true,
      message: 'Preferencia actualizada exitosamente',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  getPreferences,
  updatePreference,
};
