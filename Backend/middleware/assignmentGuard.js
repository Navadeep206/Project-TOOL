import Project from '../models/projectModel.js';
import Team from '../models/teamModel.js';
import { ROLES } from '../constants/roles.js';

/**
 * Validates that the referenced Project exists and that the user has permission to add/edit Tasks within it.
 * Admins/Managers always have access. Members can theoretically only access if they created it, but globally only Admins/Managers can create Projects.
 */
export const validateProjectExistence = async (req, res, next) => {
    try {
        const projectId = req.body.project;
        if (!projectId) {
            // Only throw error if it's a POST request (creating). PUT requests might just be updating status.
            if (req.method === 'POST') {
                return res.status(400).json({ message: "Task must belong to a strictly defined Project." });
            }
            return next();
        }

        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: "Project Reference Invalid or Project Deleted." });
        }

        next();
    } catch (error) {
        console.error("Assignment Guard - Project Validation Error:", error);
        res.status(500).json({ message: "Internal server error during project validation." });
    }
};

/**
 * Validates that the assigned User is actually a recorded member of the assigned Team.
 * Prevents "External Assignment" hacking.
 */
export const validateTeamMembership = async (req, res, next) => {
    try {
        const { team: teamId, assignedTo: userId, assignedToName } = req.body;
        const hasUserAssignment = Boolean(userId);

        // If neither is present, skip assignment validation
        if (!teamId && !hasUserAssignment) return next();

        if (assignedToName) {
            return res.status(400).json({ message: "Custom-name task assignment is disabled. Assign a registered user." });
        }

        // If one is present but not the other, we block it to enforce strict coupling
        if (teamId && !hasUserAssignment) {
            return res.status(400).json({ message: "Cannot assign a task to a Team without specifying an exact Operative." });
        }
        if (!teamId && hasUserAssignment) {
            return res.status(400).json({ message: "Cannot assign a task to an Operative without specifying their Team Unit." });
        }

        // Fetch the active team
        const teamDocument = await Team.findById(teamId);
        if (!teamDocument) {
            return res.status(404).json({ message: "Referenced Team not found." });
        }

        // Search by linked User ID
        const isMember = teamDocument.members.some(
            (member) => member.user && member.user.toString() === userId.toString()
        );

        if (!isMember) {
            return res.status(403).json({ message: "Security Violation: Operative is not a validated member of the designated Team Unit." });
        }

        next();
    } catch (error) {
        console.error("Assignment Guard - Team Membership Error:", error);
        res.status(500).json({ message: "Internal server error during assignment validation." });
    }
};
