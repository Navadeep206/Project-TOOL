import { ApprovalRequest } from '../models/approval.model.js';
import { approvalService } from '../services/approval.service.js';

export const approvalMiddleware = {
    /**
     * Validates if the user has the right to REQUEST an action.
     * - Everyone can request.
     */
    canRequest: (req, res, next) => {
        // Assuming req.user is populated by standard auth
        if (!req.user || !req.user.role) {
            return res.status(401).json({ message: 'Unauthorized. User context missing.' });
        }

        // Attach standard role to body for service processing
        req.body.requesterRole = req.user.role;
        next();
    },

    /**
     * Validates if the user has the authority to APPROVE/REJECT an action.
     * Implements RBAC rules.
     */
    canDecide: async (req, res, next) => {
        try {
            const { id } = req.params; // Approval Request ID
            const user = req.user;

            if (!user) {
                return res.status(401).json({ message: 'Unauthorized. User context missing.' });
            }

            const request = await ApprovalRequest.findById(id);

            if (!request) {
                return res.status(404).json({ message: 'Approval request not found.' });
            }

            // 1. Prevent Self-Approval at middleware level
            if (request.requesterId.toString() === user._id.toString()) {
                return res.status(403).json({ message: 'Security Exception: Self-approval is strictly forbidden.' });
            }

            // 2. Validate Authority Level
            const requiredLevel = request.approvalLevel; // 'manager' or 'admin'
            const userRole = user.role.toUpperCase(); // 'MEMBER', 'MANAGER', 'ADMIN'

            if (requiredLevel === 'admin' && userRole !== 'ADMIN') {
                return res.status(403).json({ message: 'Access Denied: Admin authorization required for this action.' });
            }

            if (requiredLevel === 'manager' && !['MANAGER', 'ADMIN'].includes(userRole)) {
                return res.status(403).json({ message: 'Access Denied: Manager authorization required for this action.' });
            }

            // 3. Audit trail setup (Attaching to request for controller to use)
            req.approvalRequest = request; // Pass validated object state downstream

            next();
        } catch (error) {
            console.error('[Approval Middleware Error]:', error);
            res.status(500).json({ message: 'Internal Server Error validating approval authority.' });
        }
    }
};
