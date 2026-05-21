import { ApprovalRequest } from '../models/approval.model.js';
import { approvalExecutionService } from './approvalExecution.service.js';
import { notificationService } from './notification.service.js';
import { auditLogService } from './auditLog.service.js';

export const approvalService = {
    /**
     * Defines which role is required to approve specific request types and how many approvals are needed.
     */
    getApprovalConfig: (requestType) => {
        switch (requestType) {
            case 'deadline_extension':
                return { level: 'manager', requiredApprovals: 1, targetType: 'Task' };
            case 'task_completion_review':
                return { level: 'manager', requiredApprovals: 1, targetType: 'Task' };
            case 'role_change':
                return { level: 'admin', requiredApprovals: 1, targetType: 'User' };
            case 'remove_user':
                return { level: 'admin', requiredApprovals: 1, targetType: 'Team' };
            case 'delete_project':
                return { level: 'admin', requiredApprovals: 2, targetType: 'Project' }; // Example of multi-level
            case 'archive_project':
                return { level: 'admin', requiredApprovals: 1, targetType: 'Project' };
            case 'project_completion':
                return { level: 'admin', requiredApprovals: 1, targetType: 'Project' };
            case 'role_promotion':
                return { level: 'admin', requiredApprovals: 1, targetType: 'User' };
            case 'project_deletion':
                return { level: 'admin', requiredApprovals: 1, targetType: 'Project' };
            case 'project_deadline_extension':
                return { level: 'manager', requiredApprovals: 1, targetType: 'Project' };
            default:
                return { level: 'admin', requiredApprovals: 1, targetType: 'Project' };
        }
    },

    /**
     * Legal state transitions for the State Machine
     */
    legalTransitions: {
        'pending': ['in_review', 'approved', 'rejected', 'cancelled'],
        'in_review': ['approved', 'rejected', 'cancelled'],
        'approved': ['executed', 'cancelled'],
        'rejected': ['closed'],
        'cancelled': ['closed'],
        'executed': ['closed'],
        'closed': []
    },

    /**
     * Creates a new approval request
     */
    createRequest: async (payload) => {
        const { requesterId, projectId, requestType, targetEntityId, reason, requesterRole, metadata } = payload;

        // 1. Prevent Duplicate Active Requests
        const existingActiveRequest = await ApprovalRequest.findOne({
            requesterId,
            projectId,
            requestType,
            targetEntityId,
            currentStatus: { $in: ['pending', 'in_review', 'approved'] }
        });

        if (existingActiveRequest) {
            throw new Error('An active approval request for this action already exists.');
        }

        // 2. Determine Required Approval Config
        const config = approvalService.getApprovalConfig(requestType);

        // 3. Create the Request
        const newRequest = await ApprovalRequest.create({
            requesterId,
            requesterRole,
            projectId,
            requestType,
            targetEntityId,
            targetEntityType: config.targetType,
            approvalLevel: config.level,
            requiredApprovals: config.requiredApprovals,
            reason,
            metadata,
            currentStatus: 'pending'
        });

        // 4. Notify Approvers (Mock logic - in real app, find users with matching role)
        // notificationService.notifyByRole(config.level, 'new_approval_request', `New ${requestType} request requires your attention.`);

        return newRequest;
    },

    /**
     * Processes a decision (Approve/Reject)
     */
    processDecision: async (requestId, approverId, decision, comments = '') => {
        const request = await ApprovalRequest.findById(requestId);
        if (!request) throw new Error('Approval request not found.');

        // 1. Validate State
        if (!['pending', 'in_review'].includes(request.currentStatus)) {
            throw new Error(`Cannot process decision for request in status: ${request.currentStatus}`);
        }

        // 2. Prevent Self-Approval
        if (request.requesterId.toString() === approverId.toString()) {
            throw new Error('Self-approval is strictly forbidden.');
        }

        // 3. Handle Rejection
        if (decision === 'rejected') {
            request.currentStatus = 'rejected';
            request.decisionHistory.push({
                approverId,
                decision: 'rejected',
                comments,
                level: request.currentLevel + 1
            });
            await request.save();

            // Notification
            notificationService.dispatch({
                recipientId: request.requesterId,
                senderId: approverId,
                type: 'approval_rejected',
                message: `Your request for ${request.requestType} was rejected.`,
                metadata: { requestId: request._id }
            });

            return request;
        }

        // 4. Handle Approval (Multi-level logic)
        request.currentLevel += 1;
        request.decisionHistory.push({
            approverId,
            decision: 'approved',
            comments,
            level: request.currentLevel
        });

        if (request.currentLevel >= request.requiredApprovals) {
            request.currentStatus = 'approved';

            // Notification
            notificationService.dispatch({
                recipientId: request.requesterId,
                senderId: approverId,
                type: 'approval_granted',
                message: `Your request for ${request.requestType} has been fully approved.`,
                metadata: { requestId: request._id }
            });

            // Automatically trigger execution for enterprise system
            await approvalService.executeApprovedRequest(request);
        } else {
            request.currentStatus = 'in_review';
        }

        await request.save();
        return request;
    },

    /**
     * Executes the approved request
     */
    executeApprovedRequest: async (request) => {
        try {
            await approvalExecutionService.execute(request);
            request.currentStatus = 'executed';

            // Audit Log
            await auditLogService.logAction(
                request.requesterId,
                'EXECUTION',
                request.targetEntityType,
                request.targetEntityId,
                `System executed approved ${request.requestType} request.`
            );
        } catch (error) {
            console.error(`[Approval Service]: Execution failed for request ${request._id}:`, error);
            // In a real app, we might move to a 'failed' state and notify admins
        }
    },

    /**
     * Cancels a pending request
     */
    cancelRequest: async (requestId, userId) => {
        const request = await ApprovalRequest.findById(requestId);
        if (!request) throw new Error('Approval request not found.');

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
