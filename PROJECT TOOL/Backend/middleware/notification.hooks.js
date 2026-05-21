import { notificationService } from '../services/notification.service.js';

/**
 * Event Hooks mapping directly to Express route lifecycles.
 * These are strictly designed to NEVER mutate `res` or `req`, allowing them 
 * to be plugged into existing routes without breaking business logic.
 */
export const notificationHooks = {
    /**
     * Hook: Triggered when a Task's 'assignedTo' field changes.
     * Expects controller to have injected target data into `res.locals` or `req.body`
     */
    onTaskAssignment: (req, res, next) => {
        res.on('finish', () => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
                // Identify the new assignee
                const assigneeId = req.body.assignedTo || (res.locals.task && res.locals.task.assignedTo);
                const taskId = req.params.taskId || req.params.id;
                const senderId = req.user ? req.user._id : null;
                const senderName = req.user ? (req.user.fullname || req.user.username) : 'Someone';

                if (assigneeId && assigneeId.toString() !== senderId?.toString()) {
                    notificationService.dispatch({
                        recipientId: assigneeId,
                        senderId,
                        type: 'task_assigned',
                        message: `${senderName} assigned you to a new task.`,
                        metadata: { taskId, action: 'view_task' }
                    });
                }
            }
        });
        next();
    },

    /**
     * Hook: Triggered when a Task or Project status changes.
     */
    onStatusChange: (req, res, next) => {
        res.on('finish', () => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
                const newStatus = req.body.status;
                const entityId = req.params.taskId || req.params.projectId || req.params.id;
                const senderId = req.user ? req.user._id : null;
                const senderName = req.user ? (req.user.fullname || req.user.username) : 'System';

                // Assuming controller attaches the project owner or stakeholders to res.locals
                const stakeholders = res.locals.stakeholders || [req.body.ownerId];

                if (newStatus && stakeholders.length > 0) {
                    // Filter out the person who made the change
                    const validRecipients = stakeholders.filter(id => id && id.toString() !== senderId?.toString());

                    if (validRecipients.length > 0) {
                        notificationService.dispatchBulk(validRecipients, {
                            senderId,
                            type: 'status_changed',
                            message: `${senderName} changed the status to '${newStatus}'.`,
                            metadata: { entityId, newStatus }
                        });
                    }
                }
            }
        });
        next();
    },

    /**
     * Hook: Triggered defensively when Admins update a user's role.
     */
    onRoleUpdate: (req, res, next) => {
        res.on('finish', () => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
                const targetUserId = req.params.userId || req.params.id;
                const newRole = req.body.role;
                const senderId = req.user ? req.user._id : null;

                if (targetUserId && newRole) {
                    notificationService.dispatch({
                        recipientId: targetUserId,
                        senderId,
                        type: 'role_update',
                        message: `Your account role has been updated to ${newRole.toUpperCase()}.`,
                        metadata: { newRole }
                    });
                }
            }
        });
        next();
    }
};
