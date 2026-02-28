import Team from '../models/teamModel.js';
import mongoose from 'mongoose';
import { ROLES } from '../constants/roles.js';

export const getTeams = async (req, res) => {
    try {
        let query = {};

        if (req.user && req.user.role === ROLES.MEMBER) {
            console.log(`[DEBUG] Isolation: Fetching teams for Member: ${req.user._id} (${req.user.email})`);
            query['members.user'] = req.user._id;
        }

        // Project context filtering
        if (req.query.projectId) {
            query.project = req.query.projectId;
        }

        const teams = await Team.find(query);
        res.status(200).json({ success: true, count: teams.length, data: teams });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createTeam = async (req, res) => {
    try {
        console.log('[DEBUG] createTeam - req.body:', req.body);
        if (!req.body.project) {
            console.warn('[DEBUG] createTeam - Missing project ID');
            return res.status(400).json({ success: false, message: "Project ID is required to create a team unit." });
        }
        const newTeam = new Team(req.body);
        const savedTeam = await newTeam.save();
        console.log('[DEBUG] createTeam - Saved:', savedTeam._id);
        res.status(201).json({ success: true, data: savedTeam });
    } catch (error) {
        console.error('[DEBUG] createTeam - Error:', error);
        res.status(400).json({ success: false, message: error.message });
    }
};
export const updateTeam = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedTeam = await Team.findByIdAndUpdate(
            id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedTeam) {
            return res.status(404).json({ success: false, message: "Team not found" });
        }
        res.status(200).json({ success: true, data: updatedTeam });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const addMemberToTeam = async (req, res) => {
    try {
        const { id } = req.params;
        const { user, role, status } = req.body;

        if (!user || !mongoose.Types.ObjectId.isValid(String(user))) {
            return res.status(400).json({ success: false, message: 'Valid existing user is required.' });
        }

        const memberPayload = {
            user: String(user),
            role: (role || 'Operative').trim(),
            status: status || 'Active'
        };

        const teamDocument = await Team.findById(id);
        if (!teamDocument) {
            return res.status(404).json({ success: false, message: 'Team not found' });
        }

        const alreadyMember = teamDocument.members.some(
            (member) => member.user && member.user.toString() === String(user)
        );
        if (alreadyMember) {
            return res.status(409).json({ success: false, message: 'User is already a member of this team.' });
        }

        const updatedTeam = await Team.findByIdAndUpdate(
            id,
            { $push: { members: memberPayload } },
            { new: true, runValidators: true }
        );

        if (!updatedTeam) {
            return res.status(404).json({ success: false, message: 'Team not found' });
        }

        res.status(200).json({ success: true, data: updatedTeam });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const updateTeamMember = async (req, res) => {
    try {
        const { id, memberId } = req.params;
        const { displayName, name, role } = req.body;

        const team = await Team.findById(id);
        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        const member = team.members.id(memberId);
        if (!member) {
            return res.status(404).json({ message: 'Member not found' });
        }

        const nextName = (displayName || name || '').trim();
        const nextRole = (role || '').trim();

        if (!nextRole) {
            return res.status(400).json({ message: 'Role is required.' });
        }

        member.role = nextRole;
        if (nextName) {
            member.displayName = nextName;
        }

        await team.save();
        res.status(200).json({ success: true, data: team });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
