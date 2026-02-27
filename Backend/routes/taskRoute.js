import express from 'express';
import { getTasks, createTask, updateTask, deleteTask } from '../controllers/taskController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { auditAction } from '../middleware/auditMiddleware.js';
import { checkTaskOwnership } from '../middleware/ownershipMiddleware.js';
import { validateProjectAccess, validateAssignment, validateTaskOwnership } from '../middleware/accessControlMiddleware.js';
import { validateStatusTransition } from '../middleware/statusWorkflow.js';
import { ROLES } from '../constants/roles.js';

const router = express.Router();

// Get all Tasks - Available to all authenticated users
router.get('/', protect, getTasks);

// Create Task - Allowed for Admins and Managers. Checked for Project Access & Proper Team Membership.
router.post('/', protect, authorizeRoles(ROLES.ADMIN, ROLES.MANAGER), validateProjectAccess, validateAssignment, auditAction('CREATE_TASK', 'task'), createTask);

// Update Task - Checked for correct context, ownership, membership and valid status transitions.
router.put('/:id', protect, validateTaskOwnership, validateAssignment, validateStatusTransition, auditAction('UPDATE_TASK', 'task'), updateTask);

// Delete Task - Strictly Admin and Manager only (Members cannot delete tasks)
router.delete('/:id', protect, authorizeRoles(ROLES.ADMIN, ROLES.MANAGER), auditAction('DELETE_TASK', 'task'), deleteTask);

export default router;
