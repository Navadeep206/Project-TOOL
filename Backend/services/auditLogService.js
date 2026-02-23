import { AuditLog } from "../models/AuditLog.js";

/**
 * Service to handle Audit Logging operations decoupled from main API logic.
 */
class AuditLogService {
    /**
     * Masks sensitive fields in objects to protect data.
     * @param {Object} data 
     * @returns {Object} masked object
     */
    maskSensitiveData(data) {
        if (!data) return data;
        const masked = { ...data };
        const sensitiveKeys = ["password", "token", "secret", "authorization", "refreshToken"];

        // Deep search or surface level. For simplicity, we just do a surface level scan
        for (const key in masked) {
            if (typeof masked[key] === 'string' && sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
                masked[key] = "***MASKED***";
            }
        }
        return masked;
    }

    /**
     * Asynchronously logs an action to the database without blocking the main thread.
     * @param {Object} params
     */
    async logAction({
        userId = null,
        userRole = "unknown",
        action,
        resourceType = "other",
        resourceId = null,
        description = "",
        ipAddress = "unknown",
        userAgent = "unknown",
        status = "success",
        metadata = {},
    }) {
        try {
            // Run asynchronously without waiting
            setImmediate(async () => {
                try {
                    const logEntry = new AuditLog({
                        userId,
                        userRole,
                        action,
                        resourceType,
                        resourceId,
                        description,
                        ipAddress,
                        userAgent,
                        status,
                        metadata: this.maskSensitiveData(metadata),
                    });

                    await logEntry.save();
                } catch (innerError) {
                    // Handle failures silently so it doesn't crash the server or block anything
                    console.error("AuditLogService Failed to save log entry:", innerError.message);
                }
            });
        } catch (error) {
            console.error("AuditLogService Encountered error queuing log:", error.message);
        }
    }

    logSecurityError(params) {
        return this.logAction({ ...params, status: "failure", resourceType: "auth" });
    }
}

export const auditService = new AuditLogService();
