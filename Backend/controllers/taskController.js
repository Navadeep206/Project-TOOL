import Task from '../models/taskModel.js';
import { notificationService } from '../services/notification.service.js';
import { ROLES } from '../constants/roles.js';

export const getTasks = async (req, res) => {
    try {
        let query = {};

        // isolation: Members only see tasks assigned to them
        if (req.user && req.user.role === ROLES.MEMBER) {
            query = { assignedTo: req.user.id };
        }

        const tasks = await Task.find(query);
        res.status(200).json({ success: true, count: tasks.length, data: tasks });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createTask = async (req, res) => {
    try {
        const { startDate, dueDate } = req.body;
        if (startDate && dueDate && new Date(startDate) > new Date(dueDate)) {
            return res.status(400).json({ success: false, message: "Start date cannot be after due date." });
        }

        const newTask = new Task(req.body);
        const savedTask = await newTask.save();

        // Trigger Notification if assigned
        if (savedTask.assignedTo) {
            notificationService.dispatch({
                recipientId: savedTask.assignedTo,
                senderId: req.user.id,
                type: 'task_assigned',
                message: `New task assigned: ${savedTask.name}`,
                metadata: { taskId: savedTask._id }
            });
        }

        res.status(201).json({ success: true, data: savedTask });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
export const updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const oldTask = await Task.findById(id);

        if (!oldTask) {
            return res.status(404).json({ success: false, message: "Task not found" });
        }

        const { startDate, dueDate } = req.body;
        const finalStart = startDate || oldTask.startDate;
        const finalDue = dueDate || oldTask.dueDate;

        if (new Date(finalStart) > new Date(finalDue)) {
            return res.status(400).json({ success: false, message: "Start date cannot be after due date." });
        }

        // Blocking Enforcement: Cannot mark 'Done' if blocked
        if (req.body.status === 'Done' && (oldTask.isBlocked || req.body.isBlocked)) {
            // Re-verify strictly from DB
            const taskCheck = await Task.findById(id).populate('dependencies');
            const stillBlocked = taskCheck.dependencies.some(dep => dep.status !== 'Done');
            if (stillBlocked) {
                return res.status(400).json({ 
                    success: false, 
                    message: "Execution blocked: One or more dependencies are not yet complete." 
                });
            }
        }

        const updatedTask = await Task.findByIdAndUpdate(
            id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedTask) {
            return res.status(404).json({ success: false, message: "Task not found" });
        }

        // If status changed to 'Done', update all dependents
        if (req.body.status === 'Done' || (oldTask.status === 'Done' && req.body.status !== 'Done')) {
            for (const depId of updatedTask.dependents) {
                await refreshBlockingStatus(depId);
            }
        }

        // Trigger Notification if assignment changed
        if (updatedTask.assignedTo && (!oldTask.assignedTo || oldTask.assignedTo.toString() !== updatedTask.assignedTo.toString())) {
            notificationService.dispatch({
                recipientId: updatedTask.assignedTo,
                senderId: req.user.id,
                type: 'task_assigned',
                message: `Task assigned to you: ${updatedTask.name}`,
                metadata: { taskId: updatedTask._id }
            });
        }

        res.status(200).json({ success: true, data: updatedTask });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        const task = await Task.findById(id);
        
        if (!task) {
            return res.status(404).json({ success: false, message: "Task not found" });
        }

        // Cleanup: Remove this task from its dependencies' 'dependents' lists
        if (task.dependencies && task.dependencies.length > 0) {
            await Task.updateMany(
                { _id: { $in: task.dependencies } },
                { $pull: { dependents: id } }
            );
        }

        // Cleanup: Remove this task from its dependents' 'dependencies' lists
        if (task.dependents && task.dependents.length > 0) {
            await Task.updateMany(
                { _id: { $in: task.dependents } },
                { $pull: { dependencies: id } }
            );
            
            // Re-calculate isBlocked for all dependents since their dependency just disappeared
            for (const depId of task.dependents) {
                await refreshBlockingStatus(depId);
            }
        }

        await Task.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "Task deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Dependency Management
 */

// Helper: DFS for Circular Dependency Detection
const hasCycle = async (startTaskId, targetDependencyId) => {
    const visited = new Set();
    const stack = [targetDependencyId];

    while (stack.length > 0) {
        const currentId = stack.pop();
        if (currentId.toString() === startTaskId.toString()) return true;

        if (!visited.has(currentId.toString())) {
            visited.add(currentId.toString());
            const task = await Task.findById(currentId).populate('dependencies');
            if (task && task.dependencies) {
                for (const dep of task.dependencies) {
                    stack.push(dep._id);
                }
            }
        }
    }
    return false;
};

// Helper: Re-calculate isBlocked for a task
const refreshBlockingStatus = async (taskId) => {
    const task = await Task.findById(taskId).populate('dependencies');
    if (!task) return;

    // A task is blocked if any of its dependencies are NOT 'Done'
    const openDependencies = task.dependencies.some(dep => dep.status !== 'Done');
    task.isBlocked = openDependencies;
    await task.save();

    // Propagate to dependents
    for (const depId of task.dependents) {
        await refreshBlockingStatus(depId);
    }
};

export const addDependency = async (req, res) => {
    try {
        const { id } = req.params; // The task that will DEPEND on another
        const { dependencyId } = req.body; // The task that will BLOCK

        if (id === dependencyId) {
            return res.status(400).json({ success: false, message: "A task cannot depend on itself." });
        }

        const [task, dependency] = await Promise.all([
            Task.findById(id),
            Task.findById(dependencyId)
        ]);

        if (!task || !dependency) {
            return res.status(404).json({ success: false, message: "Task(s) not found." });
        }

        if (task.project.toString() !== dependency.project.toString()) {
            return res.status(400).json({ success: false, message: "Dependencies must belong to the same project." });
        }

        if (task.dependencies.includes(dependencyId)) {
            return res.status(400).json({ success: false, message: "Dependency already exists." });
        }

        // Circular check
        const circular = await hasCycle(id, dependencyId);
        if (circular) {
            return res.status(400).json({ success: false, message: "Circular dependency detected." });
        }

        // Add relationships
        task.dependencies.push(dependencyId);
        dependency.dependents.push(id);

        await Promise.all([task.save(), dependency.save()]);
        await refreshBlockingStatus(id);

        res.status(200).json({ success: true, message: "Dependency added successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const removeDependency = async (req, res) => {
    try {
        const { id } = req.params;
        const { dependencyId } = req.body;

        const [task, dependency] = await Promise.all([
            Task.findById(id),
            Task.findById(dependencyId)
        ]);

        if (task) {
            task.dependencies = task.dependencies.filter(d => d.toString() !== dependencyId);
            await task.save();
            await refreshBlockingStatus(id);
        }

        if (dependency) {
            dependency.dependents = dependency.dependents.filter(d => d.toString() !== id);
            await dependency.save();
        }

        res.status(200).json({ success: true, message: "Dependency removed successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getDependencyGraph = async (req, res) => {
    try {
        const { id } = req.params;
        const task = await Task.findById(id)
            .populate('dependencies', 'name status isBlocked')
            .populate('dependents', 'name status isBlocked');
        
        res.status(200).json({ success: true, data: task });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getTimelineTasks = async (req, res) => {
    try {
        let query = {};
        if (req.user && req.user.role === ROLES.MEMBER) {
            query = { assignedTo: req.user.id };
        }

        const tasks = await Task.find(query)
            .populate('project', 'name')
            .populate('assignedTo', 'name')
            .sort({ startDate: 1 });

        res.status(200).json({ success: true, data: tasks });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
