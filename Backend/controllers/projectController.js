import Project from '../models/projectModel.js';
import Task from '../models/taskModel.js';
import Team from '../models/teamModel.js';
import { ROLES } from '../constants/roles.js';

export const getProjects = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const search = req.query.search || '';
        const startIndex = (page - 1) * limit;

        let query = {};

        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        if (req.user && req.user.role === ROLES.MEMBER) {
            console.log(`[DEBUG] Isolation: Fetching projects for Member/Lead: ${req.user._id} (${req.user.email})`);

            // Find teams where user is either a member OR the lead
            const userTeams = await Team.find({
                $or: [
                    { 'members.user': req.user._id },
                    { 'lead': req.user._id }
                ]
            }).select('project');

            console.log(`[DEBUG] Found ${userTeams.length} teams for user`);

            const projectIds = userTeams.map(t => t.project).filter(id => id);
            console.log(`[DEBUG] Associated Project IDs:`, projectIds);
            query._id = { $in: projectIds };
        }

        const total = await Project.countDocuments(query);
        const projects = await Project.find(query)
            .skip(startIndex)
            .limit(limit)
            .sort({ createdAt: -1 }); // Newest first

        res.status(200).json({
            success: true,
            count: projects.length,
            pagination: {
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                total
            },
            data: projects
        });
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
        const project = await Project.findById(id);

        if (!project) {
            return res.status(404).json({ success: false, message: "Project not found" });
        }

        // --- Industry Guard: Project Deletion Approval ---
        if (req.user.role !== ROLES.ADMIN) {
            return res.status(202).json({
                success: true,
                message: "Project deletion request submitted for approval.",
                approvalRequired: true,
                requestType: 'project_deletion',
                targetEntityId: id
            });
        }

        await Project.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "Project deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateProject = async (req, res) => {
    try {
        const { id } = req.params;
        const project = await Project.findById(id);

        if (!project) {
            return res.status(404).json({ success: false, message: "Project not found" });
        }

        // 1. Handle Project Completion Approval
        if (req.body.status === 'Completed' && project.status !== 'Completed') {
            // If user is Admin, they can bypass. Otherwise, trigger approval.
            if (req.user.role !== ROLES.ADMIN) {
                // Return message that completion requires approval
                return res.status(202).json({
                    success: true,
                    message: "Project completion request submitted for approval.",
                    approvalRequired: true,
                    requestType: 'project_completion'
                });
            }
        }

        // 2. Handle Deadline Extension Approval
        if (req.body.dueDate && new Date(req.body.dueDate) > new Date(project.dueDate)) {
            if (req.user.role !== ROLES.ADMIN && req.user.role !== ROLES.MANAGER) {
                return res.status(202).json({
                    success: true,
                    message: "Deadline extension request submitted for approval.",
                    approvalRequired: true,
                    requestType: 'project_deadline_extension'
                });
            }
        }

        const updatedProject = await Project.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

        // Identify Stakeholders for Notifications (Owner + all Team Leads)
        const teams = await Team.find({ project: id }).select('lead');
        const teamLeads = teams.map(t => t.lead).filter(id => id);
        res.locals.stakeholders = [updatedProject.owner, ...teamLeads];

        res.status(200).json({ success: true, data: updatedProject });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
