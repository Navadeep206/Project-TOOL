import { auditService } from "../services/auditLogService.js";

/**
 * Higher-order function returning a middleware to log generic API actions.
 * Extracts user info from req.user if available.
 * Does not block the main request execution.
 *
 * @param {string} action - Name of the action (e.g. 'CREATED_PROJECT')
 * @param {string} resourceType - Type of resource (e.g. 'project', 'user')
 */
export const auditAction = (action, resourceType) => {
    return (req, res, next) => {
        // Intercept response finish
        res.on("finish", () => {
            // res.statusCode represents the final status
            const isSuccess = res.statusCode >= 200 && res.statusCode < 400;

            // Extract user from request
            const user = req.user || null;
            const userId = user ? user._id || user.id : null;
            const userRole = user ? user.role : "unknown";

            // Best effort to get resourceId. For example, from req.params.id
            let resourceId = null;
            if (req.params && (req.params.id || req.params.projectId || req.params.taskId)) {
                resourceId = req.params.id || req.params.projectId || req.params.taskId;
            }

            const ipAddress =
                req.headers["x-forwarded-for"]?.split(',')[0] || req.connection?.remoteAddress || "unknown";
            const userAgent = req.headers["user-agent"] || "unknown";

            const metadata = {
                method: req.method,
                originalUrl: req.originalUrl,
                body: req.method !== "GET" ? req.body : undefined,
                query: Object.keys(req.query).length ? req.query : undefined,
            };

            // Call service asynchronously
            auditService.logAction({
                userId,
                userRole,
                action,
                resourceType,
                resourceId,
                description: `API Request: ${req.method} ${req.originalUrl} - Resolved with ${res.statusCode}`,
                ipAddress,
                userAgent,
                status: isSuccess ? "success" : "failure",
                metadata,
            });
        });

        next();
    };
};

/**
 * Specific middleware for logging Failed Logins and Authentication issues.
 */
export const auditAuthError = (req, res, next) => {
    res.on("finish", () => {
        // 401 Unauthorized or 403 Forbidden
        if (res.statusCode === 401 || res.statusCode === 403) {
            const ipAddress =
                req.headers["x-forwarded-for"]?.split(',')[0] || req.connection?.remoteAddress || "unknown";
            const userAgent = req.headers["user-agent"] || "unknown";

            const emailAttempt = req.body?.email || "unknown";

            auditService.logSecurityError({
                action: res.statusCode === 401 ? "LOGIN_FAILED" : "UNAUTHORIZED_ACCESS",
                resourceType: "auth",
                description: `Auth Failure on ${req.originalUrl}. Attempted email: ${emailAttempt}`,
                ipAddress,
                userAgent,
                metadata: {
                    method: req.method,
                    originalUrl: req.originalUrl,
                    statusCode: res.statusCode,
                    headers: req.headers, // Caution, service will mask tokens
                },
            });
        }
    });
    next();
};
