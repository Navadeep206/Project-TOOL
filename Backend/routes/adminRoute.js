import express from 'express';
import { sendInvite } from '../controllers/invitationController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { ROLES } from '../constants/roles.js';
import { inviteLimiter } from '../middleware/rateLimiter.js';

const adminRoute = express.Router();

// Only Admin and Manager can send invites, with rate limiting
adminRoute.post('/invite', protect, authorizeRoles(ROLES.ADMIN, ROLES.MANAGER), inviteLimiter, sendInvite);

export default adminRoute;
