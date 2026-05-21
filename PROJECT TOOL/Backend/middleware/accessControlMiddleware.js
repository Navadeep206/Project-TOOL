import Project from '../models/projectModel.js';
import Team from '../models/teamModel.js';
import Task from '../models/taskModel.js';
import { ROLES } from '../constants/roles.js';

/**
 * Ensures user has access to a specific project.
 * - Admin/Manager: Global access.
 * - Member: Only if they belong to a Team linked to this project.
 */
export const validateProjectAccess = async (req, res, next) => {
    try {
        const projectId = req.params.projectId || req.body.project || req.query.projectId;

        if (!projectId) {
            return res.status(400).json({ message: "Project context is required for this operation." });
        }

        if (req.user.role === ROLES.ADMIN || req.user.role === ROLES.MANAGER) {
            return next();
        }

        // Check if member is in any team belonging to this project
        const userInProjectTeam = await Team.findOne({
            project: projectId,
            'members.user': req.user._id
        });

        if (!userInProjectTeam) {
            return res.status(403).json({
                message: "Access Denied: You are not assigned to any team in this project."
            });
        }

        next();
    } catch (error) {
        console.error("Access Control - Project Validation Error:", error);
        res.status(500).json({ message: "Internal server error during project access validation." });
    }
};

/**
 * Validates that an assignment target is valid for a project.
 * - Team must belong to the project.
 * - User must belong to that team.
 */
export const validateAssignment = async (req, res, next) => {
    try {
        const { project: projectId, team: teamId, assignedTo: userId } = req.body;

        if (!projectId || !teamId || !userId) {
            return next(); // Skip if assignment is incomplete, let model validation handle if required
        }

        const team = await Team.findOne({ _id: teamId, project: projectId });
        if (!team) {
            return res.status(400).json({
                message: "Invalid Assignment: Specified Team does not belong to this Project."
            });
        }

        const isMember = team.members.some(m => m.user && m.user.toString() === userId.toString());
        if (!isMember) {
            return res.status(400).json({
                message: "Invalid Assignment: Targeted user is not a member of the project team."
            });
        }

        next();
    } catch (error) {
        console.error("Access Control - Assignment Validation Error:", error);
        res.status(500).json({ message: "Internal server error during assignment validation." });
    }
};

/**
 * Restricts MEMBER updates to status-only for tasks assigned to them.
 * Admins/Managers can edit everything.
 */
export const validateTaskOwnership = async (req, res, next) => {
    try {
        if (req.user.role === ROLES.ADMIN || req.user.role === ROLES.MANAGER) {
            return next();
        }

        const { id } = req.params;
        const task = await Task.findById(id);

        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        if (task.assignedTo.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Access Denied: You can only update tasks assigned to you." });
        }

        // Enforce status-only update for members
        const updates = Object.keys(req.body);
        const allowedUpdates = ['status'];
        const isValidOperation = updates.every(update => allowedUpdates.includes(update));

        if (!isValidOperation) {
            return res.status(403).json({ message: "Access Denied: Members can only update task status." });
        }

        next();
    } catch (error) {
        console.error("Access Control - Task Ownership Error:", error);
        res.status(500).json({ message: "Internal server error during task ownership validation." });
    }
};

/**
 * Ensures user has authority to manage a specific team.
 * - Admin/Manager: Global authority.
 * - Team Lead: Can manage their specific team (even if role is Member).
 */
export const validateTeamManagementAccess = async (req, res, next) => {
    try {
        const teamId = req.params.id || req.body.teamId;

        if (!teamId) {
            return res.status(400).json({ message: "Team context is required for this operation." });
        }

        if (req.user.role === ROLES.ADMIN || req.user.role === ROLES.MANAGER) {
            return next();
        }

        const team = await Team.findById(teamId);
        if (!team) {
            return res.status(404).json({ message: "Team not found." });
        }

        // Check if current user is the assigned Lead
        if (team.lead.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: "Access Denied: Only Admins, Managers, or the Team Lead can manage this unit."
            });
        }

        next();
    } catch (error) {
        console.error("Access Control - Team Management Validation Error:", error);
        res.status(500).json({ message: "Internal server error during team authority validation." });
    }
};
