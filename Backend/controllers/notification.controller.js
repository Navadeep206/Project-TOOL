import { Notification } from '../models/notification.model.js';

export const notificationController = {
    /**
     * Get user's notifications (paginated)
     * GET /api/v1/notifications
     */
    getUserNotifications: async (req, res) => {
        try {
            const recipientId = req.user._id;
            const { page = 1, limit = 15, unreadOnly = false } = req.query;

            const query = { recipientId };
            if (unreadOnly === 'true') {
                query.isRead = false;
            }

            const skip = (parseInt(page) - 1) * parseInt(limit);

            const notifications = await Notification.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .populate('senderId', 'fullname username profileImage') // Get sender details
                .lean();

            const total = await Notification.countDocuments(query);
            const unreadCount = await Notification.countDocuments({ recipientId, isRead: false });

            return res.status(200).json({
                success: true,
                data: {
                    notifications,
                    pagination: {
                        total,
                        page: parseInt(page),
                        limit: parseInt(limit),
                        totalPages: Math.ceil(total / limit)
                    },
                    unreadCount
                }
            });
        } catch (error) {
            console.error('[Notification Controller Error - Get]:', error);
            return res.status(500).json({
                success: false,
                message: 'Server error fetching notifications.'
            });
        }
    },

    /**
     * Mark a single notification as read
     * PATCH /api/v1/notifications/:id/read
     */
    markAsRead: async (req, res) => {
        try {
            const { id } = req.params;
            const recipientId = req.user._id;

            const notification = await Notification.findOneAndUpdate(
                { _id: id, recipientId }, // Enforces ownership validation natively
                { isRead: true },
                { new: true }
            );

            if (!notification) {
                return res.status(404).json({ success: false, message: 'Notification not found or access denied.' });
            }

            return res.status(200).json({
                success: true,
                message: 'Notification marked as read.',
                data: notification
            });
        } catch (error) {
            console.error('[Notification Controller Error - Mark Read]:', error);
            return res.status(500).json({ success: false, message: 'Server error updating notification.' });
        }
    },

    /**
     * Mark all user's notifications as read
     * PATCH /api/v1/notifications/read-all
     */
    markAllAsRead: async (req, res) => {
        try {
            const recipientId = req.user._id;

            await Notification.updateMany(
                { recipientId, isRead: false },
                { isRead: true }
            );

            return res.status(200).json({
                success: true,
                message: 'All notifications marked as read.'
            });
        } catch (error) {
            console.error('[Notification Controller Error - Mark All Read]:', error);
            return res.status(500).json({ success: false, message: 'Server error updating notifications.' });
        }
    },

    /**
     * Delete a single notification
     * DELETE /api/v1/notifications/:id
     */
    deleteNotification: async (req, res) => {
        try {
            const { id } = req.params;
            const recipientId = req.user._id;

            const notification = await Notification.findOneAndDelete({ _id: id, recipientId });

            if (!notification) {
                return res.status(404).json({ success: false, message: 'Notification not found or access denied.' });
            }

            return res.status(200).json({
                success: true,
                message: 'Notification deleted successfully.'
            });
        } catch (error) {
            console.error('[Notification Controller Error - Delete]:', error);
            return res.status(500).json({ success: false, message: 'Server error deleting notification.' });
        }
    }
};
