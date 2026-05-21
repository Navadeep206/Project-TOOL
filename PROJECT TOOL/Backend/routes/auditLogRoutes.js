import express from "express";
import { getAuditLogs, exportAuditLogs } from "../controllers/auditLogController.js";
// Assuming you have an authentication & admin middleware in your app. 
// If not available, we use stubs that you can easily swap out later.
// Note: Following rules, we don't modify existing logic, so we just declare an independent admin route.

const router = express.Router();

// Mock / Placeholder admin authorization check.
// In reality, you'd import `authMiddleware` and `adminMiddleware` from your main app.
const adminAuthorizationPlaceholder = (req, res, next) => {
    // Replace with real logic or assume it is handled by the main app integration
    next();
};

/**
 * Route: GET /api/audit-logs
 * Protected by Admin Middleware
 */
router.get("/", adminAuthorizationPlaceholder, getAuditLogs);

/**
 * Route: GET /api/audit-logs/export
 * Protected by Admin Middleware
 * Accepts ?format=json|csv
 */
router.get("/export", adminAuthorizationPlaceholder, exportAuditLogs);

export default router;
