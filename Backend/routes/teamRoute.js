import express from 'express';
import { getTeams, createTeam, updateTeam, addMemberToTeam, updateTeamMember } from '../controllers/teamController.js';
import { auditAction } from '../middleware/auditMiddleware.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { ROLES } from '../constants/roles.js';
import { validateProjectAccess } from '../middleware/accessControlMiddleware.js';

const router = express.Router();

// All team operations require authentication to ensure proper audit logging
router.use(protect);

router.get('/', getTeams);
router.post('/', authorizeRoles(ROLES.ADMIN, ROLES.MANAGER), validateProjectAccess, auditAction('CREATE_TEAM', 'team'), createTeam);
router.post('/:id/members', authorizeRoles(ROLES.ADMIN, ROLES.MANAGER), auditAction('ADD_TEAM_MEMBER', 'team'), addMemberToTeam);
router.put('/:id/members/:memberId', authorizeRoles(ROLES.ADMIN, ROLES.MANAGER), auditAction('UPDATE_TEAM_MEMBER', 'team'), updateTeamMember);
router.put('/:id', authorizeRoles(ROLES.ADMIN, ROLES.MANAGER), auditAction('UPDATE_TEAM', 'team'), updateTeam);

export default router;
