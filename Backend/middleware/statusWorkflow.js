import Task from '../models/taskModel.js';

export const validateStatusTransition = async (req, res, next) => {
    try {
        const { status } = req.body;
        const taskId = req.params.id;

        if (!status) return next();

        const validStatuses = ['Pending', 'In Progress', 'Done'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid Status code parameter provided." });
        }

        const allowedTransitions = {
            'Pending': ['Pending', 'In Progress'],
            'In Progress': ['In Progress', 'Pending', 'Done'],
            'Done': ['Done', 'In Progress']
        };

        // If updating existing task, verify transition
        if (req.method === 'PUT' && taskId) {
            const task = await Task.findById(taskId);
            if (task && !allowedTransitions[task.status].includes(status)) {
                return res.status(400).json({
                    message: `Invalid transition: Cannot move task from ${task.status} to ${status}`
                });
            }
        }

        next();
    } catch (error) {
        console.error("Status Workflow Error:", error);
        res.status(500).json({ message: "Internal server error during status validation." });
    }
};
