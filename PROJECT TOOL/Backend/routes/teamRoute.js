import express from 'express';
import { getTeams, createTeam, updateTeam, addMemberToTeam, updateTeamMember, deleteTeam, removeMemberFromTeam } from '../controllers/teamController.js';
import { auditAction } from '../middleware/auditMiddleware.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { ROLES } from '../constants/roles.js';
import { validateProjectAccess, validateTeamManagementAccess } from '../middleware/accessControlMiddleware.js';

const router = express.Router();

// All team operations require authentication to ensure proper audit logging
router.use(protect);

router.get('/', getTeams);
router.post('/', authorizeRoles(ROLES.ADMIN, ROLES.MANAGER), validateProjectAccess, auditAction('CREATE_TEAM', 'team'), createTeam);
router.post('/:id/members', validateTeamManagementAccess, auditAction('ADD_TEAM_MEMBER', 'team'), addMemberToTeam);
router.put('/:id/members/:memberId', validateTeamManagementAccess, auditAction('UPDATE_TEAM_MEMBER', 'team'), updateTeamMember);
router.delete('/:id/members/:memberId', validateTeamManagementAccess, auditAction('REMOVE_TEAM_MEMBER', 'team'), removeMemberFromTeam);
router.put('/:id', validateTeamManagementAccess, auditAction('UPDATE_TEAM', 'team'), updateTeam);
router.delete('/:id', authorizeRoles(ROLES.ADMIN, ROLES.MANAGER), auditAction('DELETE_TEAM', 'team'), deleteTeam);

export default router;
