import express from 'express';
import { getProjects, createProject, updateProject, deleteProject } from '../controllers/projectController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { auditAction } from '../middleware/auditMiddleware.js';
import { ROLES } from '../constants/roles.js';
import { validateRequest } from '../middleware/validateMiddleware.js';
import { projectSchema } from '../validation/schemas.js';
import { notificationHooks } from '../middleware/notification.hooks.js';

const router = express.Router();

// Get Projects - Available to all authenticated users (Admin, Manager, Member)
router.get('/', protect, getProjects);

// Create Project - Allowed for Admins and Managers
router.post('/',
    protect,
    authorizeRoles(ROLES.ADMIN, ROLES.MANAGER),
    validateRequest(projectSchema),
    auditAction('CREATE_PROJECT', 'project'),
    createProject
);

// Update Project - Allowed for Admins, Managers, and potentially Team Leads
router.put('/:id', protect, notificationHooks.onStatusChange, auditAction('UPDATE_PROJECT', 'project'), updateProject);

// Delete Project - Strictly Admin Only
router.delete('/:id', protect, authorizeRoles(ROLES.ADMIN), auditAction('DELETE_PROJECT', 'project'), deleteProject);

export default router;
