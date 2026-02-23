import Task from '../models/taskModel.js';
import { ROLES } from '../constants/roles.js';

/**
 * Middleware ensuring members can only modify their own assigned tasks.
 * Admins and Managers bypass this check automatically.
 */
export const checkTaskOwnership = async (req, res, next) => {
    try {
        // 1. Bypass check for upper management roles
        if (req.user.role === ROLES.ADMIN || req.user.role === ROLES.MANAGER) {
            return next();
        }

        // 2. Fetch the target task
        const taskId = req.params.id;
        const task = await Task.findById(taskId);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // 3. Check ownership for MEMBER role
        if (task.assignedTo && task.assignedTo.toString() === req.user._id.toString()) {
            // It's their task, they can proceed
            return next();
        }

        // 4. If they don't own it and aren't admin/manager, forbid access
        return res.status(403).json({
            message: 'Forbidden: You do not have permission to modify a task assigned to someone else'
        });

    } catch (error) {
        console.error('Ownership Check Error:', error.message);
        return res.status(500).json({ message: 'Server Error during ownership verification' });
    }
};
