import mongoose from 'mongoose';

/**
 * Activity History Model
 * Tracks all user interactions and system events within a project.
 */
const activitySchema = new mongoose.Schema(
    {
        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            required: true,
            index: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        userName: {
            type: String,
            required: true,
        },
        // E.g., 'Admin', 'Manager', 'Member', etc.
        userRole: {
            type: String,
            required: true,
        },
        actionType: {
            type: String,
            enum: ['create', 'update', 'delete', 'assign', 'comment', 'status'],
            required: true,
            index: true,
        },
        entityType: {
            type: String,
            enum: ['project', 'task', 'comment', 'user', 'file'],
            required: true,
        },
        // The specific task ID, comment ID, etc.
        entityId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        // Store previous state (useful for undo or detailed diffs)
        oldValue: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
        // Store new state
        newValue: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
        // Auto-generated human-readable message 
        // Example: "Rahul updated Task #21 status to Done"
        message: {
            type: String,
            required: true,
        },
        // Flag for actions performed by automated triggers rather than direct user interaction
        isSystemGenerated: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: { createdAt: true, updatedAt: false }, // Activities are immutable 
    }
);

// Compound indexes for optimal querying and filtering performance
activitySchema.index({ projectId: 1, createdAt: -1 });
activitySchema.index({ projectId: 1, actionType: 1 });
activitySchema.index({ projectId: 1, userId: 1 });

export const Activity = mongoose.model('Activity', activitySchema);
