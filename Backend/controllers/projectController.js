import Project from '../models/projectModel.js';
import Task from '../models/taskModel.js';
import Team from '../models/teamModel.js';
import { ROLES } from '../constants/roles.js';

export const getProjects = async (req, res) => {
    try {
        let query = {};

        if (req.user && req.user.role === ROLES.MEMBER) {
            console.log(`[DEBUG] Isolation: Fetching projects for Member: ${req.user._id} (${req.user.email})`);
            const memberTeams = await Team.find({ 'members.user': req.user._id }).select('project');
            console.log(`[DEBUG] Found ${memberTeams.length} teams for user`);

            const projectIds = memberTeams.map(t => t.project).filter(id => id);
            console.log(`[DEBUG] Associated Project IDs:`, projectIds);
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
