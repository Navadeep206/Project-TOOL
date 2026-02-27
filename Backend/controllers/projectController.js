import Project from '../models/projectModel.js';
import Task from '../models/taskModel.js';
import Team from '../models/teamModel.js';
import { ROLES } from '../constants/roles.js';

export const getProjects = async (req, res) => {
    try {
        let query = {};

        // isolation: Members only see projects where they are in the associated team
        if (req.user && req.user.role === ROLES.MEMBER) {
            const memberTeams = await Team.find({ 'members.user': req.user.id }).select('project');
            const projectIds = memberTeams.map(t => t.project).filter(id => id);
            query = { _id: { $in: projectIds } };
        }

        const projects = await Project.find(query);
        res.status(200).json({ success: true, count: projects.length, data: projects });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createProject = async (req, res) => {
    try {
        const newProject = new Project(req.body);
        const savedProject = await newProject.save();
        res.status(201).json({ success: true, data: savedProject });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const deleteProject = async (req, res) => {
    try {
        const { id } = req.params;
        const project = await Project.findByIdAndDelete(id);
        if (!project) {
            return res.status(404).json({ success: false, message: "Project not found" });
        }
        res.status(200).json({ success: true, message: "Project deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
