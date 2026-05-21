import { Notification } from '../models/notification.model.js';

/**
 * Enterprise-grade asynchronous Notification Engine
 */
export const notificationService = {
    /**
     * Dispatches a single notification asynchronously with retry logic.
     * Completely non-blocking to the main Express event loop.
     */
    dispatch: (payload, retries = 3) => {
        // Fire and forget wrapped in setImmediate
        setImmediate(async () => {
            try {
                const { recipientId, senderId, type, message, metadata } = payload;

                const notification = await Notification.create({
                    recipientId,
                    senderId,
                    type,
                    message,
                    metadata
                });

                // Setup for future Delivery Channels (Sockets, Emails, Push)
                // e.g. socketService.emitToUser(recipientId, 'new_notification', notification);
                // e.g. emailQueue.add({ to: recipientEmail, subject: 'New Alert', body: message });

                // Mocked Delivery Log
                // console.log(`[Notification Delivered] to ${recipientId}: ${message}`);

            } catch (error) {
                console.error(`[Notification Service Error] Attempt failed:`, error.message);
                if (retries > 0) {
                    console.warn(`[Notification Service] Retrying... (${retries} attempts left)`);
                    // Exponential backoff mock
                    setTimeout(() => notificationService.dispatch(payload, retries - 1), 1000 * (4 - retries));
                } else {
                    console.error(`[Notification Service] Final failure. Notification dropped for ${payload.recipientId}.`);
                }
            }
        });
    },

    /**
     * Dispatches notifications to multiple recipients simultaneously.
     * Useful for team-wide announcements or project status changes.
     */
    dispatchBulk: (recipientIds, commonPayload) => {
        setImmediate(async () => {
            try {
                if (!Array.isArray(recipientIds) || recipientIds.length === 0) return;

                const notifications = recipientIds.map(recipientId => ({
                    ...commonPayload,
                    recipientId,
                }));

                // Execute batch insert (unordered to prevent entire batch failure on single doc error)
                await Notification.insertMany(notifications, { ordered: false });

                // Mocked Bulk Delivery logic
                // recipientIds.forEach(id => socketService.emitToUser(id, 'new_notification', commonPayload));

            } catch (error) {
                console.error('[Notification Service Bulk Error] Failed bulk dispatch:', error.message);
            }
        });
    }
};
