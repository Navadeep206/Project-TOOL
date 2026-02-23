import { ApprovalRequest } from '../models/approval.model.js';
import { approvalService } from '../services/approval.service.js';

export const approvalController = {
    /**
     * Create a new approval request
     * POST /api/v1/approvals
     */
    createRequest: async (req, res) => {
        try {
            const { projectId, requestType, targetEntityId, reason } = req.body;
            const requesterId = req.user._id;
            const requesterRole = req.user.role; // Extract from auth payload

            const newRequest = await approvalService.createRequest({
                requesterId,
                requesterRole,
                projectId,
                requestType,
                targetEntityId,
                reason
            });

            return res.status(201).json({
                success: true,
                message: 'Approval request created successfully.',
                data: newRequest
            });
        } catch (error) {
            console.error('[Approval Controller Error - Create]:', error);
            return res.status(error.message.includes('exists') ? 409 : 500).json({
                success: false,
                message: error.message || 'Server error creating request.'
            });
        }
    },

    /**
     * Approve or Reject a request
     * PATCH /api/v1/approvals/:id/decide
     */
    decideRequest: async (req, res) => {
        try {
            const { id } = req.params;
            const { decision, comments } = req.body; // 'approved' or 'rejected'
            const approverId = req.user._id;

            if (!['approved', 'rejected'].includes(decision)) {
                return res.status(400).json({ success: false, message: 'Invalid decision type.' });
            }

            const updatedRequest = await approvalService.processTransition(id, approverId, decision, comments);

            return res.status(200).json({
                success: true,
                message: `Approval request ${decision} successfully.`,
                data: updatedRequest
            });
        } catch (error) {
            console.error('[Approval Controller Error - Decide]:', error);
            return res.status(400).json({
                success: false,
                message: error.message || 'Server error processing decision.'
            });
        }
    },

    /**
     * Cancel an active request (Requester only)
     * PATCH /api/v1/approvals/:id/cancel
     */
    cancelRequest: async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user._id;

            const cancelledRequest = await approvalService.cancelRequest(id, userId);

            return res.status(200).json({
                success: true,
                message: 'Request cancelled successfully.',
                data: cancelledRequest
            });
        } catch (error) {
            console.error('[Approval Controller Error - Cancel]:', error);
            return res.status(400).json({
                success: false,
                message: error.message || 'Server error cancelling request.'
            });
        }
    },

    /**
     * View pending approvals targeted at the user's role
     * GET /api/v1/approvals/pending
     */
    getPendingApprovals: async (req, res) => {
        try {
            const userRole = req.user.role.toLowerCase(); // admin, manager, member
            const query = { currentStatus: { $in: ['pending', 'in_review'] } };

            // Admins see all admin-level requests + manager level
            // Managers see only manager-level requests
            if (userRole === 'admin') {
                query.approvalLevel = { $in: ['admin', 'manager', 'super_admin'] };
            } else if (userRole === 'manager') {
                query.approvalLevel = 'manager';
            } else {
                // Members cannot approve anything, return empty
                return res.status(200).json({ success: true, data: [] });
            }

            const requests = await ApprovalRequest.find(query)
                .populate('requesterId', 'fullname username email')
                .populate('projectId', 'name status')
                .sort({ createdAt: 1 })
                .lean();

            return res.status(200).json({ success: true, data: requests });
        } catch (error) {
            console.error('[Approval Controller Error - Get Pending]:', error);
            return res.status(500).json({ success: false, message: 'Server error fetching pending approvals.' });
        }
    },

    /**
     * View historical request log
     * GET /api/v1/approvals/history
     */
    getApprovalHistory: async (req, res) => {
        try {
            const { page = 1, limit = 20, status } = req.query;
            const query = { currentStatus: { $in: ['approved', 'rejected', 'cancelled', 'executed', 'closed'] } };

            if (status) query.currentStatus = status;

            const skip = (parseInt(page) - 1) * parseInt(limit);

            const requests = await ApprovalRequest.find(query)
                .populate('requesterId', 'fullname username')
                .populate('approverId', 'fullname username')
                .populate('projectId', 'name')
                .sort({ updatedAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .lean();

            return res.status(200).json({ success: true, data: requests });
        } catch (error) {
            console.error('[Approval Controller Error - Get History]:', error);
            return res.status(500).json({ success: false, message: 'Server error fetching history.' });
        }
    }
};
