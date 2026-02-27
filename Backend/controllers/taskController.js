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

        const updatedTask = await Task.findByIdAndUpdate(
            id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedTask) {
            return res.status(404).json({ success: false, message: "Task not found" });
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
        const task = await Task.findByIdAndDelete(id);
        if (!task) {
            return res.status(404).json({ success: false, message: "Task not found" });
        }
        res.status(200).json({ success: true, message: "Task deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
