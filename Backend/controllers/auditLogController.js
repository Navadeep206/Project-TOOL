import { AuditLog } from "../models/AuditLog.js";
import { Parser } from 'json2csv';

/**
 * Controller for Admin Read-Only Audit Log routes
 */
export const getAuditLogs = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            search,
            action,
            userRole,
            resourceType,
            status,
            startDate,
            endDate,
        } = req.query;

        const query = {};

        // Filters
        if (action) query.action = action;
        if (userRole) query.userRole = userRole;
        if (resourceType) query.resourceType = resourceType;
        if (status) query.status = status;

        // Date Range
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        // Search Log Description or User agent
        if (search) {
            query.$or = [
                { description: { $regex: search, $options: "i" } },
                { action: { $regex: search, $options: "i" } },
                { userAgent: { $regex: search, $options: "i" } }
            ];
        }

        // Pagination
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const skip = (pageNum - 1) * limitNum;

        // Execute query
        const logs = await AuditLog.find(query)
            .populate("userId", "name email") // Optionally populate user details
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .exec();

        const total = await AuditLog.countDocuments(query);

        return res.status(200).json({
            success: true,
            data: logs,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum),
            },
        });
    } catch (error) {
        console.error("Error fetching audit logs:", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while fetching audit logs.",
        });
    }
};

/**
 * Controller for exporting audit logs (JSON / CSV format)
 */
export const exportAuditLogs = async (req, res) => {
    try {
        const {
            action,
            userRole,
            resourceType,
            status,
            startDate,
            endDate,
            format = 'json'
        } = req.query;

        const query = {};

        if (action) query.action = action;
        if (userRole) query.userRole = userRole;
        if (resourceType) query.resourceType = resourceType;
        if (status) query.status = status;

        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        // Export without pagination limits, but could add a high limit (e.g., 10000) for safety
        const logs = await AuditLog.find(query)
            .populate("userId", "name email")
            .sort({ createdAt: -1 })
            .limit(10000)
            .exec();

        if (format === 'csv') {
            // Map to flat structure for CSV
            const flatLogs = logs.map(log => ({
                ID: log._id.toString(),
                User_ID: log.userId ? log.userId._id.toString() : 'N/A',
                User_Email: log.userId ? log.userId.email : 'N/A',
                Role: log.userRole,
                Action: log.action,
                Resource_Type: log.resourceType,
                Resource_ID: log.resourceId || 'N/A',
                Description: log.description || '',
                Status: log.status,
                IP_Address: log.ipAddress,
                Created_At: log.createdAt.toISOString()
            }));

            const fields = ['ID', 'User_ID', 'User_Email', 'Role', 'Action', 'Resource_Type', 'Resource_ID', 'Description', 'Status', 'IP_Address', 'Created_At'];
            const json2csvParser = new Parser({ fields });
            const csv = json2csvParser.parse(flatLogs);

            res.header('Content-Type', 'text/csv');
            res.attachment('audit_logs.csv');
            return res.send(csv);
        } else {
            // JSON format
            res.header('Content-Type', 'application/json');
            res.attachment('audit_logs.json');
            return res.send(JSON.stringify({ data: logs }, null, 2));
        }
    } catch (error) {
        console.error("Error exporting audit logs:", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while exporting audit logs.",
        });
    }
};
