import Task from '../models/taskModel.js';
import mongoose from 'mongoose';

/**
 * Get overall project metrics (Total, Completed, Overdue, % Completion)
 */
export const getProjectMetrics = async (req, res) => {
    try {
        const { projectId } = req.params;
        const pid = new mongoose.Types.ObjectId(projectId);

        const metrics = await Task.aggregate([
            { $match: { project: pid } },
            {
                $group: {
                    _id: null,
                    totalTasks: { $sum: 1 },
                    completedTasks: {
                        $sum: { $cond: [{ $eq: ["$status", "Done"] }, 1, 0] }
                    },
                    overdueTasks: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $ne: ["$status", "Done"] },
                                        { $lt: ["$dueDate", new Date()] }
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    totalTasks: 1,
                    completedTasks: 1,
                    overdueTasks: 1,
                    completionPercentage: {
                        $cond: [
                            { $gt: ["$totalTasks", 0] },
                            { $multiply: [{ $divide: ["$completedTasks", "$totalTasks"] }, 100] },
                            0
                        ]
                    }
                }
            }
        ]);

        res.json({ success: true, data: metrics[0] || { totalTasks: 0, completedTasks: 0, overdueTasks: 0, completionPercentage: 0 } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get productivity metrics (Tasks completed per member, Avg time)
 */
export const getProductivityMetrics = async (req, res) => {
    try {
        const { projectId } = req.params;
        const pid = new mongoose.Types.ObjectId(projectId);

        const productivity = await Task.aggregate([
            { $match: { project: pid, assignedTo: { $ne: null } } },
            {
                $group: {
                    _id: "$assignedTo",
                    completedCount: { $sum: { $cond: [{ $eq: ["$status", "Done"] }, 1, 0] } },
                    totalTasks: { $sum: 1 },
                    // Simplified avg time (days difference between creation and completion if tracked, but let's use createdAt/updatedAt for proxy)
                    avgCompletionDays: {
                        $avg: {
                            $cond: [
                                { $eq: ["$status", "Done"] },
                                { $divide: [{ $subtract: ["$updatedAt", "$createdAt"] }, 1000 * 60 * 60 * 24] },
                                null
                            ]
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'userInfo'
                }
            },
            { $unwind: "$userInfo" },
            {
                $project: {
                    _id: 0,
                    userId: "$_id",
                    name: "$userInfo.name",
                    completedCount: 1,
                    totalTasks: 1,
                    avgCompletionDays: { $round: ["$avgCompletionDays", 1] }
                }
            },
            { $sort: { completedCount: -1 } }
        ]);

        res.json({ success: true, data: productivity });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get priority distribution for pie charts
 */
export const getPriorityDistribution = async (req, res) => {
    try {
        const { projectId } = req.params;
        const pid = new mongoose.Types.ObjectId(projectId);

        const distribution = await Task.aggregate([
            { $match: { project: pid } },
            {
                $group: {
                    _id: "$priority",
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    priority: "$_id",
                    count: 1
                }
            }
        ]);

        res.json({ success: true, data: distribution });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get Burn-down chart data
 * Simplified estimate based on dueDates trend
 */
export const getBurnDownData = async (req, res) => {
    try {
        const { projectId } = req.params;
        const pid = new mongoose.Types.ObjectId(projectId);

        // Calculate cumulative remaining tasks by day (ideal vs actual is complex, let's show status over time)
        const timeline = await Task.aggregate([
            { $match: { project: pid } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    tasksCreated: { $sum: 1 },
                    tasksDone: { $sum: { $cond: [{ $eq: ["$status", "Done"] }, 1, 0] } }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        res.json({ success: true, data: timeline });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
