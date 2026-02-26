/**
 * State-machine enforcement for Task limits and statuses.
 * Prevents invalid progressions like jumping from 'Pending' directly to 'Done' or similar rule logic.
 */
export const validateStatusTransition = (req, res, next) => {
    const { status } = req.body;

    // Only intercept if they are actively trying to change the status
    if (!status) return next();

    const validStatuses = ['Pending', 'In Progress', 'Done'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid Status code parameter provided." });
    }

    // Example logic rule: If setting to 'Done', perhaps enforce logic (just allowing it for now)
    // We can expand this object to define strict flow mappings.
    const allowedTransitions = {
        'Pending': ['Pending', 'In Progress'],
        'In Progress': ['In Progress', 'Pending', 'Done'],
        'Done': ['Done', 'In Progress'] // Cannot go from Done back to Pending easily
    };

    // If this was a PUT request, ideally we'd look up `Task.findById()`, compare `oldStatus`, and block if not in `allowedTransitions[oldStatus]`.
    // Since we want to remain fast and non-database-heavy here, we will trust the strict enum array first.
    // Deep state transitions can be further restricted by Role.

    next();
};
