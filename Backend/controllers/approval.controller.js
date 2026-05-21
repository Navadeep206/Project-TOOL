import { ApprovalRequest } from '../models/approval.model.js';
import { approvalService } from '../services/approval.service.js';

export const approvalController = {
    /**
     * Create a new approval request
     * POST /api/v1/approvals
     */
    createRequest: async (req, res) => {
        try {
            const { projectId, requestType, targetEntityId, reason, metadata } = req.body;
            const requesterId = req.user._id;
            const requesterRole = req.user.role; // Extract from auth payload

            const newRequest = await approvalService.createRequest({
                requesterId,
                requesterRole,
                projectId,
                requestType,
                targetEntityId,
                reason,
                metadata: req.body.metadata // Pass through metadata
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

            const updatedRequest = await approvalService.processDecision(id, approverId, decision, comments);

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
            const { page = 1, limit = 10 } = req.query;

            // RBAC Filtering
            if (userRole === 'admin' || userRole === 'super_admin') {
                query.approvalLevel = { $in: ['admin', 'manager', 'super_admin'] };
            } else if (userRole === 'manager') {
                query.approvalLevel = 'manager';
            } else {
                return res.status(200).json({ success: true, data: [] });
            }

            const skip = (parseInt(page) - 1) * parseInt(limit);

            const requests = await ApprovalRequest.find(query)
                .populate('requesterId', 'fullname username email')
                .populate('projectId', 'name status')
                .populate('decisionHistory.approverId', 'fullname username')
                .sort({ createdAt: 1 })
                .skip(skip)
                .limit(parseInt(limit))
                .lean();

            const total = await ApprovalRequest.countDocuments(query);

            return res.status(200).json({
                success: true,
                data: requests,
                pagination: { total, page: parseInt(page), limit: parseInt(limit) }
            });
        } catch (error) {
            console.error('[Approval Controller Error - Get Pending]:', error);
            return res.status(500).json({ success: false, message: 'Server error fetching pending approvals.' });
        }
    },

    /**
     * View user's own requests
     * GET /api/v1/approvals/my-requests
     */
    getMyRequests: async (req, res) => {
        try {
            const requesterId = req.user._id;
            const { page = 1, limit = 10 } = req.query;
            const skip = (parseInt(page) - 1) * parseInt(limit);

            const requests = await ApprovalRequest.find({ requesterId })
                .populate('projectId', 'name')
                .populate('decisionHistory.approverId', 'fullname username')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .lean();

            const total = await ApprovalRequest.countDocuments({ requesterId });

            return res.status(200).json({
                success: true,
                data: requests,
                pagination: { total, page: parseInt(page), limit: parseInt(limit) }
            });
        } catch (error) {
            console.error('[Approval Controller Error - Get My Requests]:', error);
            return res.status(500).json({ success: false, message: 'Server error fetching your requests.' });
        }
    },

    /**
     * View historical request log
     * GET /api/v1/approvals/history
     */
    getApprovalHistory: async (req, res) => {
        try {
            const { page = 1, limit = 20, status, type } = req.query;
            const query = { currentStatus: { $in: ['approved', 'rejected', 'cancelled', 'executed', 'closed'] } };

            if (status) query.currentStatus = status;
            if (type) query.requestType = type;

            const skip = (parseInt(page) - 1) * parseInt(limit);

            const requests = await ApprovalRequest.find(query)
                .populate('requesterId', 'fullname username')
                .populate('projectId', 'name')
                .populate('decisionHistory.approverId', 'fullname username')
                .sort({ updatedAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .lean();

            const total = await ApprovalRequest.countDocuments(query);

            return res.status(200).json({
                success: true,
                data: requests,
                pagination: { total, page: parseInt(page), limit: parseInt(limit) }
            });
        } catch (error) {
            console.error('[Approval Controller Error - Get History]:', error);
            return res.status(500).json({ success: false, message: 'Server error fetching history.' });
        }
    }
};
