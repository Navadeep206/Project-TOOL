import { activityService } from '../services/activity.service.js';

/**
 * Auto-Tracking middleware/hook for entity updates.
 * Hooks into the request lifecycle (res.on('finish')) to track changes automatically
 * without having to rewrite existing controller logic.
 * 
 * Usage:
 * router.patch('/tasks/:id', trackActivity({ entityType: 'task', actionType: 'update' }), updateTaskController);
 * 
 * @param {Object} options Configuration block specifying entity expectations
 */
export const trackActivity = (options = {}) => {
    return (req, res, next) => {
        // Intercept standard response ending
        res.on('finish', () => {
            // Only record an activity if the request was successful
            if (res.statusCode >= 200 && res.statusCode < 300) {

                // This relies on the standard structure that:
                // 1. req.user is populated by an authentication middleware beforehand.
                // 2. req.project is populated (or provided in req.params/req.body)
                const user = req.user;

                // Attempt to extract projectId from different possible request locations
                const projectId = req.params.projectId || req.body.projectId || (req.project && req.project._id);

                // If we don't have basic tracking prerequisites, abort tracking silently
                if (!user || !projectId) return;

                // Extract potentially passed contextual info
                const entityId = req.params.id || req.params.taskId || req.params.userId || null;

                // If your endpoints inject old/new values primarily into res.locals, extract them:
                // (Assuming you mutate res.locals.oldDocument or res.locals.newDocument inside controllers)
                const oldValue = res.locals.oldValue || {};
                const newValue = res.locals.newValue || req.body || {};

                // Determine properties updated (if any specific one to highlight)
                let property = null;
                if (req.body.status) property = 'status';

                const payload = {
                    projectId,
                    userId: user._id,
                    userName: user.fullname || user.username || 'System User',
                    userRole: user.role || 'Member',
                    actionType: options.actionType || 'update',
                    entityType: options.entityType || 'project',
                    entityId: entityId || projectId, // fallback to project if modifying project root
                    entityName: res.locals.entityName || req.body.title || req.body.name || `${options.entityType}`,
                    oldValue,
                    newValue,
                    property,
                    isSystemGenerated: false
                };

                // Fire and forget
                activityService.logActivity(payload);
            }
        });

        next();
    };
};
