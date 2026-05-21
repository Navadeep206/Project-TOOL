import express from 'express';
import { getMyInvitations, joinProjectFromInvite, rejectInvitation } from '../controllers/invitationController.js';
import { protect } from '../middleware/authMiddleware.js';

const invitationRoute = express.Router();

invitationRoute.use(protect);

invitationRoute.get('/my-invites', getMyInvitations);
invitationRoute.post('/:id/join', joinProjectFromInvite);
invitationRoute.post('/:id/reject', rejectInvitation);

export default invitationRoute;
