import Invitation from '../models/invitationModel.js';
import User from '../models/userModel.js';
import Team from '../models/teamModel.js';
import { generateRawToken, hashToken } from '../utils/tokenUtils.js';
import { ROLES } from '../constants/roles.js';
import generateToken from '../utils/generateToken.js';

/**
 * @desc    Send an invitation
 * @route   POST /api/admin/invite
 * @access  Admin/Manager
 */
export const sendInvite = async (req, res) => {
    try {
        const { email, role, projectId, name } = req.body;

        if (!email || !role) {
            return res.status(400).json({ message: 'Email and role are required' });
        }

        // Prevent inviting as Admin unless the requester is an Admin
        if (role === ROLES.ADMIN && req.user.role !== ROLES.ADMIN) {
            return res.status(403).json({ message: 'Only Admins can invite other Admins' });
        }

        // Check if user already exists
        const userExists = await User.findOne({ email: email.toLowerCase() });
        if (userExists) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        // Check if there's already a pending invite
        const existingInvite = await Invitation.findOne({ email: email.toLowerCase(), status: 'pending' });
        if (existingInvite) {
            // Check if it's expired, if so mark it and allow new one
            if (existingInvite.expiresAt < new Date()) {
                existingInvite.status = 'expired';
                await existingInvite.save();
            } else {
                return res.status(400).json({ message: 'A pending invitation already exists for this email' });
            }
        }

        const rawToken = generateRawToken();
        const encryptedToken = hashToken(rawToken);

        const invitation = await Invitation.create({
            email: email.toLowerCase(),
            name,
            role,
            projectId,
            invitedBy: req.user._id,
            token: encryptedToken,
            expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000) // 48 hours
        });

        const inviteLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/accept-invite?token=${rawToken}`;

        // Mock email sending (log to console as per requirements)
        console.log(`[INVITATION SENT]
        To: ${email}
        Role: ${role}
        Link: ${inviteLink}
        Expires: ${invitation.expiresAt}`);

        res.status(201).json({
            success: true,
            message: 'Invitation sent successfully',
            data: {
                id: invitation._id,
                email: invitation.email,
                role: invitation.role,
                expiresAt: invitation.expiresAt,
                debugLink: inviteLink
            }
        });

    } catch (error) {
        console.error('SendInvite Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Accept an invitation and create account
 * @route   POST /api/auth/accept-invite
 * @access  Public
 */
export const acceptInvite = async (req, res) => {
    try {
        const { token, name, password } = req.body;

        if (!token || !name || !password) {
            return res.status(400).json({ message: 'Token, name, and password are required' });
        }

        const hashedToken = hashToken(token);
        const invitation = await Invitation.findOne({ token: hashedToken });

        if (!invitation) {
            return res.status(400).json({ message: 'Invalid or expired invitation token' });
        }

        if (invitation.status !== 'pending') {
            return res.status(400).json({ message: `Invitation has already been ${invitation.status}` });
        }

        if (invitation.expiresAt < new Date()) {
            invitation.status = 'expired';
            await invitation.save();
            return res.status(400).json({ message: 'Invitation token has expired' });
        }

        // Create User
        const user = await User.create({
            name,
            email: invitation.email,
            password,
            role: invitation.role,
            grantedBy: invitation.invitedBy
        });

        // Mark invitation as accepted
        invitation.status = 'accepted';
        await invitation.save();

        // If projectId exists, we might want to auto-assign them to a team or project
        // This logic depends on the specific project-team-task hierarchy
        // For now, let's log it.
        if (invitation.projectId) {
            console.log(`[PROJ_ASSIGN] User ${user.email} should be added to Project ${invitation.projectId}`);
            // Implementation detail: find or create a team for this project if not already handled
        }

        generateToken(res, user._id, user.role);

        res.status(201).json({
            success: true,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('AcceptInvite Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Verify invitation token and get details
 * @route   GET /api/users/verify-invite/:token
 * @access  Public
 */
export const verifyInvite = async (req, res) => {
    try {
        const { token } = req.params;
        const hashedToken = hashToken(token);

        const invitation = await Invitation.findOne({
            token: hashedToken,
            status: 'pending',
            expiresAt: { $gt: new Date() }
        });

        if (!invitation) {
            return res.status(404).json({ success: false, message: 'Invalid or expired invitation' });
        }

        res.status(200).json({
            success: true,
            data: {
                email: invitation.email,
                name: invitation.name,
                role: invitation.role
            }
        });
    } catch (err) {
        console.error('Verify Invite Error:', err);
        res.status(500).json({ success: false, message: 'Server error verifying invitation' });
    }
};
