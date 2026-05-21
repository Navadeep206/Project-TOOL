import { createUser, loginUser, deleteUser, getUsers, updateUserRole } from '../controllers/userController.js';
import { acceptInvite, verifyInvite } from '../controllers/invitationController.js';
import express from 'express';
import { auditAction, auditAuthError } from '../middleware/auditMiddleware.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { notificationHooks } from '../middleware/notification.hooks.js';
import { ROLES } from '../constants/roles.js';

const userRoute = express.Router();

// Apply auth error auditing to all user routes to catch failed logins
userRoute.use(auditAuthError);

userRoute.get('/', getUsers);
userRoute.post('/', auditAction('USER_REGISTRATION', 'user'), createUser);
userRoute.post('/login', loginUser);
userRoute.post('/register', auditAction('USER_REGISTRATION', 'user'), createUser);
userRoute.post('/accept-invite', auditAction('USER_INVITE_ACCEPTANCE', 'user'), acceptInvite);
userRoute.get('/verify-invite/:token', verifyInvite);
// Role Update - Strictly Admin only
userRoute.put('/:id/role', protect, authorizeRoles(ROLES.ADMIN), notificationHooks.onRoleUpdate, updateUserRole);
userRoute.delete('/:id', auditAction('DELETE_USER', 'user'), deleteUser);

export default userRoute;
