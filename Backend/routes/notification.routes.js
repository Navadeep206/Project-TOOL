import express from 'express';
import { notificationController } from '../controllers/notification.controller.js';

// Requires standard authentication middleware to populate req.user
// import isAuthenticated from '../middleware/isAuthenticated.js';

const router = express.Router();

// Apply auth broadly to all routes
// router.use(isAuthenticated);

/**
 * Route: /api/v1/notifications
 */

// Get user notifications (supports ?page=1&limit=15&unreadOnly=true)
router.get('/', notificationController.getUserNotifications);

// Mark all as read
router.patch('/read-all', notificationController.markAllAsRead);

// Mark specific notification as read
router.patch('/:id/read', notificationController.markAsRead);

// Delete specific notification
router.delete('/:id', notificationController.deleteNotification);

export default router;
