import { sendSuccess, sendError } from '../helpers/response.js';
import { getNotificationsRepo, markAsReadRepo, getUnreadCountRepo } from '../repository/notification.repo.js';

export const getNotifications = async (req, res) => {
  try {
    const { id: userId } = req.user;
    
    console.log('Fetching notifications for:', { userId });
    
    const notifications = await getNotificationsRepo(userId);
    const unreadCount = await getUnreadCountRepo(userId);
    
    console.log('Found notifications:', notifications.length);
    console.log('Unread count:', unreadCount);
    
    return sendSuccess(res, {
      notifications,
      unreadCount
    }, 'Notifications fetched successfully');
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return sendError(res, 'Failed to fetch notifications', 500);
  }
};

export const markNotificationsAsRead = async (req, res) => {
  try {
    const { notificationIds } = req.body;
    const { id: userId } = req.user;
    
    if (!notificationIds || !Array.isArray(notificationIds) || notificationIds.length === 0) {
      return sendError(res, 'Notification IDs are required', 400);
    }
    
    const result = await markAsReadRepo(notificationIds, userId);
    
    return sendSuccess(res, {
      updatedCount: result.modifiedCount
    }, 'Notifications marked as read successfully');
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    return sendError(res, 'Failed to mark notifications as read', 500);
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const { id: userId } = req.user;
    
    const unreadCount = await getUnreadCountRepo(userId);
    
    return sendSuccess(res, {
      unreadCount
    }, 'Unread count fetched successfully');
  } catch (error) {
    console.error('Error fetching unread count:', error);
    return sendError(res, 'Failed to fetch unread count', 500);
  }
};
