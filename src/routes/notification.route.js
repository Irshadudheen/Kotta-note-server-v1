import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { getNotifications, markNotificationsAsRead, getUnreadCount } from '../controller/notification.controller.js';

const router = express.Router();

// Get all active notifications for the current user
router.get('/', authenticateToken, getNotifications);

// Get unread notification count
router.get('/unread-count', authenticateToken, getUnreadCount);

// Mark notifications as read
router.patch('/read', authenticateToken, markNotificationsAsRead);

export default router;
