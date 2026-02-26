import express from 'express';
import { getProjects, createProject, deleteProject } from '../controllers/projectController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { auditAction } from '../middleware/auditMiddleware.js';
import { ROLES } from '../constants/roles.js';

const router = express.Router();

// Get Projects - Available to all authenticated users (Admin, Manager, Member)
router.get('/', protect, getProjects);

// Create Project - Allowed for Admins and Managers
router.post('/', protect, authorizeRoles(ROLES.ADMIN, ROLES.MANAGER), auditAction('CREATE_PROJECT', 'project'), createProject);

// Delete Project - Strictly Admin Only
router.delete('/:id', protect, authorizeRoles(ROLES.ADMIN), auditAction('DELETE_PROJECT', 'project'), deleteProject);

export default router;
