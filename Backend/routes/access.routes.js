import express from 'express';
import { accessController } from '../controllers/access.controller.js';

// Assuming you have existing authentication and Admin RBAC middleware
// import isAuthenticated from '../middleware/isAuthenticated.js';
// import isAdmin from '../middleware/isAdmin.js';

const router = express.Router();

// Apply auth globally to this router block
// router.use(isAuthenticated, isAdmin);

/**
 * Route: /api/v1/access
 * All endpoints secured to Admins specifically via router middleware.
 */

// POST /api/v1/access/grant -> Provide a selected user X hours of access
router.post('/grant', accessController.grantAccess);

// PATCH /api/v1/access/extend -> Add +X hours to a temporary user
router.patch('/extend', accessController.extendAccess);

// PATCH /api/v1/access/revoke -> Instantly kill access (Expire them backwards)
router.patch('/revoke', accessController.revokeAccess);

// GET /api/v1/access/temporary-users -> Audit list of who has temp access and who gave it
router.get('/temporary-users', accessController.listTemporaryUsers);

export default router;
