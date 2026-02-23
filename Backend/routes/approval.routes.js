import express from 'express';
import { approvalController } from '../controllers/approval.controller.js';
import { approvalMiddleware } from '../middleware/approval.middleware.js';

// Assuming you have a robust global auth middleware to protect these routes
// import isAuthenticated from '../middleware/isAuthenticated.js';

const router = express.Router();

/**
 * Route: /api/v1/approvals
 * 
 * Note: These should be mounted securely in app.js
 */

// 1. View routes (Based on implicit role of requester)
router.get('/pending', approvalController.getPendingApprovals);
router.get('/history', approvalController.getApprovalHistory);

// 2. Creation route (Anyone can request, middleware extracts role)
router.post(
    '/',
    approvalMiddleware.canRequest,
    approvalController.createRequest
);

// 3. Decision route (Strictly guarded by RBAC Middleware)
// Approvers provide { decision: 'approved' | 'rejected', comments: '...' }
router.patch(
    '/:id/decide',
    approvalMiddleware.canDecide,
    approvalController.decideRequest
);

// 4. Cancellation route (Requester only)
router.patch(
    '/:id/cancel',
    approvalController.cancelRequest
);

export default router;
