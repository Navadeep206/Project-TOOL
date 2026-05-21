import { Activity } from '../models/activity.model.js';

/**
 * Controller for retrieving project-related Activity History.
 * Read-only APIs to get the timeline, filter, and search.
 */
export const activityController = {
    /**
     * Get project timeline (paginated)
     * 
     * GET /api/v1/activities/project/:projectId
     * Query params:
     *  - page: int (default 1)
     *  - limit: int (default 20)
     *  - actionType: string (filter by create/update etc)
     *  - userId: string (filter by specific user)
     *  - entityType: string (filter by project/task/comment etc)
     *  - search: string (text search in message)
     */
    getProjectActivities: async (req, res) => {
        try {
            const { projectId } = req.params;
            const {
                page = 1,
                limit = 20,
                actionType,
                userId,
                entityType,
                search
            } = req.query;

            // Ensure the user actually belongs to this project (implement existing specific middleware or logic)
            // For this isolated plugin, we assume `req.user` verified the JWT
            // and a custom validation middleware handles project membership.

            const query = { projectId };

            if (actionType) query.actionType = actionType;
            if (userId) query.userId = userId;
            if (entityType) query.entityType = entityType;

            if (search) {
                // Simple regex search on the generated message
                query.message = { $regex: search, $options: 'i' };
            }

            const skip = (parseInt(page) - 1) * parseInt(limit);

            const activities = await Activity.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .populate('userId', 'fullname username profileImage') // Optionally populate user details
                .lean(); // Return raw JSON to save memory

            const total = await Activity.countDocuments(query);

            res.status(200).json({
                success: true,
                data: {
                    activities,
                    pagination: {
                        total,
                        page: parseInt(page),
                        limit: parseInt(limit),
                        totalPages: Math.ceil(total / limit)
                    }
                }
            });
        } catch (error) {
            console.error('[Activity Controller Error]:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error while retrieving project activities'
            });
        }
    }
};
