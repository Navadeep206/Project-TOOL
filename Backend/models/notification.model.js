import mongoose from 'mongoose';

/**
 * Notification Schema
 * Handles individual alerts sent to users.
 */
const notificationSchema = new mongoose.Schema(
    {
        recipientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        // Sender could be a User or null (meaning System generated)
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        type: {
            type: String,
            enum: [
                'task_assigned',
                'status_changed',
                'deadline_approaching',
                'role_update',
                'comment_added',
                'project_update',
                'system_alert'
            ],
            required: true,
            index: true,
        },
        message: {
            type: String,
            required: true,
            trim: true,
            maxlength: 1000,
        },
        // Useful for frontend routing or identifying the actionable item (e.g., { taskId: "123", projectId: "456" })
        metadata: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
        isRead: {
            type: Boolean,
            default: false,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

// High-performance compound indexes
// 1. Fetching unread notifications for a specific user ordered by newest
notificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });
// 2. Fetching all notifications for a user
notificationSchema.index({ recipientId: 1, createdAt: -1 });

export const Notification = mongoose.model('Notification', notificationSchema);
