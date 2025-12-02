const express = require('express');
const authRoutes = require('./auth');
const projectRoutes = require('./projects');
const documentRoutes = require('./documents');
const commentRoutes = require('./comments');
const notificationRoutes = require('./notifications');
const userRoutes = require('./users');

const router = express.Router();

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'SGPTI API is running',
    timestamp: new Date().toISOString(),
  });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);
router.use('/documents', documentRoutes);
router.use('/comments', commentRoutes);
router.use('/notifications', notificationRoutes);
router.use('/users', userRoutes);

module.exports = router;
