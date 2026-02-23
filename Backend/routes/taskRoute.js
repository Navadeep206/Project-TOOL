import express from 'express';
import { getTasks, createTask, updateTask, deleteTask } from '../controllers/taskController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { checkTaskOwnership } from '../middleware/ownershipMiddleware.js';
import { ROLES } from '../constants/roles.js';

const router = express.Router();

// Get all Tasks - Available to all authenticated users
router.get('/', protect, getTasks);

// Create Task - Allowed for Admins and Managers (Members cannot assign tasks)
router.post('/', protect, authorizeRoles(ROLES.ADMIN, ROLES.MANAGER), createTask);

// Update Task - Allowed if you are Admin, Manager, or the Member assigned to THIS specific task
router.put('/:id', protect, checkTaskOwnership, updateTask);

// Delete Task - Strictly Admin and Manager only (Members cannot delete tasks)
router.delete('/:id', protect, authorizeRoles(ROLES.ADMIN, ROLES.MANAGER), deleteTask);

export default router;
