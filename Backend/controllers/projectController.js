import Project from '../models/projectModel.js';
import Task from '../models/taskModel.js';
import { ROLES } from '../constants/roles.js';

export const getProjects = async (req, res) => {
    try {
        let query = {};

        // isolation: Members only see projects they have tasks in
        if (req.user && req.user.role === ROLES.MEMBER) {
            const memberTasks = await Task.find({ assignedTo: req.user.id }).select('project');
            const projectIds = memberTasks.map(t => t.project);
            query = { _id: { $in: projectIds } };
        }

        const projects = await Project.find(query);
        res.status(200).json(projects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createProject = async (req, res) => {
    try {
        const newProject = new Project(req.body);
        const savedProject = await newProject.save();
        res.status(201).json(savedProject);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteProject = async (req, res) => {
    try {
        const { id } = req.params;
        const project = await Project.findByIdAndDelete(id);
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }
        res.status(200).json({ message: "Project deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
