import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: false, // Sometimes actions are performed pre-auth (e.g. failed login)
        },
        userRole: {
            type: String,
            default: "unknown",
        },
        action: {
            type: String,
            required: true,
            index: true,
        },
        resourceType: {
            type: String,
            required: true,
            index: true,
            enum: ["project", "task", "user", "auth", "system", "team", "other"],
            default: "other",
        },
        resourceId: {
            type: mongoose.Schema.Types.ObjectId,
            required: false, // Some actions (like login) don't act on a specific resource
        },
        description: {
            type: String,
        },
        ipAddress: {
            type: String,
        },
        userAgent: {
            type: String,
        },
        status: {
            type: String,
            enum: ["success", "failure"],
            required: true,
        },
        metadata: {
            type: mongoose.Schema.Types.Mixed, // For any extra context
            default: {},
        },
    },
    { timestamps: true }
);

// Indexes for performance (search and filtering)
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, status: 1 });
auditLogSchema.index({ createdAt: -1 });

export const AuditLog = mongoose.model("AuditLog", auditLogSchema);
