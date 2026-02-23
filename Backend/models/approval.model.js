import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

/**
 * Approval Request Schema
 * Handles state tracking for sensitive organizational actions.
 */
const approvalRequestSchema = new mongoose.Schema(
    {
        requestId: {
            type: String,
            default: uuidv4,
            unique: true,
            index: true,
        },
        requesterId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        requesterRole: {
            type: String,
            enum: ['MEMBER', 'MANAGER', 'ADMIN'],
            required: true,
        },
        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            required: true,
            index: true,
        },
        requestType: {
            type: String,
            enum: [
                'role_change',
                'delete_project',
                'remove_user',
                'archive_project',
                'deadline_extension'
            ],
            required: true,
            index: true,
        },
        // ID of the user to remove, or the project to delete, etc.
        targetEntityId: {
            type: mongoose.Schema.Types.ObjectId, // Could be User or Project ID
            required: true,
        },
        currentStatus: {
            type: String,
            enum: ['pending', 'in_review', 'approved', 'rejected', 'cancelled', 'executed', 'closed'],
            default: 'pending',
            index: true,
        },
        // The required level of authority to approve this specific request
        approvalLevel: {
            type: String,
            enum: ['manager', 'admin', 'super_admin'],
            required: true,
        },
        // The specific user who made the final decision
        approverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        reason: {
            type: String,
            required: true,
            trim: true,
            maxlength: 1000,
        },
        // Comments provided by the approver during approval/rejection
        comments: {
            type: String,
            trim: true,
            maxlength: 1000,
        },
    },
    {
        timestamps: true, // Auto manages createdAt and updatedAt
    }
);

// Compound indexes for optimal querying 
approvalRequestSchema.index({ projectId: 1, currentStatus: 1 });
approvalRequestSchema.index({ requesterId: 1, currentStatus: 1 });
approvalRequestSchema.index({ requestType: 1, targetEntityId: 1 }, { unique: false });

export const ApprovalRequest = mongoose.model('ApprovalRequest', approvalRequestSchema);
