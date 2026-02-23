import { ApprovalRequest } from '../models/approval.model.js';

export const approvalService = {
    /**
     * Defines which role is required to approve specific request types.
     */
    getRequiredApprovalLevel: (requestType) => {
        switch (requestType) {
            case 'deadline_extension':
                return 'manager'; // Managers can approve deadline extensions
            case 'role_change':
            case 'remove_user':
            case 'archive_project':
            case 'delete_project':
                return 'admin'; // Sensitive actions require Admin authority
            default:
                return 'admin';
        }
    },

    /**
     * Legal state transitions for the State Machine
     */
    legalTransitions: {
        'pending': ['in_review', 'approved', 'rejected', 'cancelled'],
        'in_review': ['approved', 'rejected', 'cancelled'],
        'approved': ['executed'],
        'rejected': ['closed'],
        'cancelled': ['closed'],
        'executed': [],
        'closed': []
    },

    /**
     * Creates a new approval chain, preventing duplicates
     */
    createRequest: async (payload) => {
        const { requesterId, projectId, requestType, targetEntityId, reason, requesterRole } = payload;

        // 1. Prevent Duplicate Active Requests
        const existingActiveRequest = await ApprovalRequest.findOne({
            requesterId,
            projectId,
            requestType,
            targetEntityId,
            currentStatus: { $in: ['pending', 'in_review'] }
        });

        if (existingActiveRequest) {
            throw new Error('An active approval request for this action already exists.');
        }

        // 2. Determine Required Approval Level
        const approvalLevel = approvalService.getRequiredApprovalLevel(requestType);

        // 3. Create the Request
        const newRequest = await ApprovalRequest.create({
            requesterId,
            requesterRole,
            projectId,
            requestType,
            targetEntityId,
            approvalLevel,
            reason,
            currentStatus: 'pending' // Initial State
        });

        return newRequest;
    },

    /**
     * Processes the State Machine transition safely
     */
    processTransition: async (requestId, approverId, newStatus, comments = '') => {
        const request = await ApprovalRequest.findById(requestId);

        if (!request) {
            throw new Error('Approval request not found.');
        }

        // 1. Validate State Transition
        const allowedNextStates = approvalService.legalTransitions[request.currentStatus];

        if (!allowedNextStates.includes(newStatus)) {
            throw new Error(`Illegal state transition. Cannot move from ${request.currentStatus} to ${newStatus}.`);
        }

        // 2. Prevent Self-Approval (handled primarily in Middleware, but fail-deadly here)
        if (request.requesterId.toString() === approverId.toString() && newStatus === 'approved') {
            throw new Error('Self-approval is strictly forbidden.');
        }

        // 3. Update Document
        request.currentStatus = newStatus;
        request.approverId = approverId;
        if (comments) {
            request.comments = comments;
        }

        // (Optional) Here you would hook into the actual business logic if an action is APPROVED.
        // E.g., if (newStatus === 'approved') trigger actual project deletion
        // For this plug-in, we just update the workflow state to 'approved' and eventually 'executed'.

        await request.save();

        return request;
    },

    /**
     * Cancels a pending request (only available to the original requester)
     */
    cancelRequest: async (requestId, userId) => {
        const request = await ApprovalRequest.findById(requestId);

        if (!request) {
            throw new Error('Approval request not found.');
        }

        if (request.requesterId.toString() !== userId.toString()) {
            throw new Error('Only the original requester can cancel this request.');
        }

        if (!['pending', 'in_review'].includes(request.currentStatus)) {
            throw new Error('Only active requests can be cancelled.');
        }

        request.currentStatus = 'cancelled';
        await request.save();

        return request;
    }
};
