import Invitation from '../models/invitationModel.js';
import User from '../models/userModel.js';
import Team from '../models/teamModel.js';
import Project from '../models/projectModel.js';
import { Notification } from '../models/notification.model.js';
import { hashToken, generateRawToken } from '../utils/tokenUtils.js';
import { ROLES } from '../constants/roles.js';
import generateToken from '../utils/generateToken.js';
import { emailService } from '../services/email.service.js';

/**
 * @desc    Fetch pending/accepted invitations for the logged-in user
 */
export const getMyInvitations = async (req, res) => {
    try {
        console.log(`[INVITE_FETCH] Fetching for user: ${req.user.email} (${req.user._id})`);
        const invites = await Invitation.find({
            $or: [
                { email: req.user.email.toLowerCase() },
                { targetUserId: req.user._id }
            ],
            status: { $in: ['pending', 'accepted'] },
            expiresAt: { $gt: new Date() }
        }).populate('projectId', 'name').populate('invitedBy', 'name email');

        console.log(`[INVITE_FETCH] Found ${invites.length} active invitations`);
        res.status(200).json({ success: true, data: invites });
    } catch (error) {
        console.error('[INVITE_FETCH] Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Finalize joining a project and its teams
 */
export const joinProjectFromInvite = async (req, res) => {
    try {
        const { id } = req.params;
        const invitation = await Invitation.findById(id);

        console.log(`[JOIN_START] User ${req.user.email} attempting to join via invite ${id}`);

        if (!invitation) {
            console.error(`[JOIN_ERROR] Invitation ${id} not found`);
            return res.status(404).json({ success: false, message: 'Invitation not found' });
        }

        if (invitation.status === 'joined') {
            return res.status(400).json({ success: false, message: 'You have already joined this project' });
        }

        // Security check
        const isEmailMatch = invitation.email === req.user.email.toLowerCase();
        const isIdMatch = String(invitation.targetUserId) === String(req.user._id);

        if (!isEmailMatch && !isIdMatch) {
            console.error(`[JOIN_ERROR] Unauthorized. User: ${req.user.email}, Expected: ${invitation.email}`);
            return res.status(403).json({ success: false, message: 'This invitation belongs to another user' });
        }

        if (!invitation.projectId) {
            console.error(`[JOIN_ERROR] Invitation ${id} has no projectId assigned.`);
            return res.status(400).json({ success: false, message: 'This invitation is not linked to a specific project. Please contact Admin.' });
        }

        const projectExists = await Project.findById(invitation.projectId);
        if (!projectExists) {
            console.error(`[JOIN_ERROR] Project ${invitation.projectId} no longer exists.`);
            return res.status(404).json({ success: false, message: 'The project for this invitation no longer exists.' });
        }

        if (invitation.projectId) {
            const teams = await Team.find({ project: invitation.projectId });
            console.log(`[JOIN_TEAMS] Found ${teams.length} teams for project ${invitation.projectId}`);

            if (teams.length > 0) {
                for (const team of teams) {
                    const alreadyMember = team.members.some(m => m.user && String(m.user) === String(req.user._id));
                    if (!alreadyMember) {
                        team.members.push({
                            user: req.user._id,
                            role: invitation.role || ROLES.MEMBER,
                            status: 'Active'
                        });
                        await team.save();
                        console.log(`[JOIN_SUCCESS] Added ${req.user.email} to team ${team.name}`);
                    } else {
                        console.log(`[JOIN_SKIP] ${req.user.email} already in team ${team.name}`);
                    }
                }
            } else {
                console.warn(`[JOIN_WARN] No teams exist for project ${invitation.projectId}`);
                // Not returning 404 here, we can still mark invite as joined
            }
        }

        invitation.status = 'joined';
        invitation.targetUserId = req.user._id;
        await invitation.save();

        // Auto-dismiss related notifications
        await Notification.deleteMany({
            recipientId: req.user._id,
            'metadata.inviteId': String(id)
        });

        res.status(200).json({ success: true, message: 'Joined project successfully' });
    } catch (error) {
        console.error(`[JOIN_CRITICAL] Error:`, error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Reject/Decline an invitation
 */
export const rejectInvitation = async (req, res) => {
    try {
        const { id } = req.params;
        const invitation = await Invitation.findById(id);

        if (!invitation) return res.status(404).json({ success: false, message: 'Invitation not found' });

        invitation.status = 'rejected';
        await invitation.save();

        // Auto-dismiss related notifications
        await Notification.deleteMany({
            recipientId: req.user._id,
            'metadata.inviteId': String(id)
        });

        res.status(200).json({ success: true, message: 'Invitation declined' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Send an invitation (Existing or New Email)
 */
export const sendInvite = async (req, res) => {
    try {
        const { email, role, projectId, name } = req.body;

        if (!projectId) {
            return res.status(400).json({ success: false, message: 'A Project must be selected to invite users.' });
        }

        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ success: false, message: 'Selected project not found.' });
        }

        const normalizedEmail = email.toLowerCase();
        console.log(`[INVITE_DEBUG] Initialized. Email: ${normalizedEmail}, Role: ${role}, Project: ${projectId}`);

        const existingUser = await User.findOne({ email: normalizedEmail });
        console.log(`[INVITE_DEBUG] Existing User Found: ${!!existingUser}`);

        const rawToken = generateRawToken();
        const encryptedToken = hashToken(rawToken);
        console.log(`[INVITE_DEBUG] Tokens Generated`);

        try {
            console.log(`[INVITE_DEBUG] Attempting to create Invitation record...`);
            const invitationParams = {
                email: normalizedEmail,
                name,
                role,
                projectId,
                invitedBy: req.user._id,
                targetUserId: existingUser ? existingUser._id : null,
                token: encryptedToken,
                expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000)
            };
            console.log(`[INVITE_DEBUG] Payload:`, JSON.stringify(invitationParams));

            const invitation = await Invitation.create(invitationParams);
            console.log(`[INVITE_DEBUG] Invitation Created Successfully: ${invitation._id}`);
            
            // Re-assign for remaining logic
            req.currentInvitation = invitation;

        } catch (dbErr) {
            console.error(`[INVITE_DEBUG_ERROR] Failed to create invitation:`, dbErr);
            if (dbErr.code === 11000) {
                return res.status(400).json({ success: false, message: 'An active invitation for this user and project already exists.' });
            }
            throw dbErr;
        }

        const invitation = req.currentInvitation;

        if (existingUser) {
            await Notification.create({
                recipientId: existingUser._id,
                senderId: req.user._id,
                type: 'system_alert',
                message: `Identity ${req.user.name} invited you to join a Project Unit.`,
                metadata: { inviteId: invitation._id, type: 'PROJECT_INVITE' }
            });
        }

        const inviteLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/accept-invite?token=${rawToken}`;
        console.log(`[INVITE_SENT] To: ${normalizedEmail} | Role: ${role} | Link: ${inviteLink}`);

        // Dispatch email and wait for result
        let emailSent = false;
        try {
            emailSent = await emailService.sendInvitationEmail(normalizedEmail, inviteLink, role, project.name);
        } catch (emailErr) {
            console.error('[INVITE_EMAIL_ERROR]', emailErr);
        }

        res.status(201).json({
            success: true,
            message: emailSent ? 'Invitation transmitted successfully' : 'Invitation generated, but email transmission failed',
            data: {
                id: invitation._id,
                debugLink: inviteLink,
                emailSent,
                recipientEmail: normalizedEmail
            }
        });
    } catch (error) {
        console.error('[INVITE_SEND_ERROR]', error);
        
        // Final fallback for any other uncaught 11000 errors
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'An active invitation for this user and project already exists.' });
        }
        
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Accept invitation link (Public onboarding)
 */
export const acceptInvite = async (req, res) => {
    try {
        const { token, name, password } = req.body;
        const hashedToken = hashToken(token);
        const invitation = await Invitation.findOne({ token: hashedToken, status: 'pending' });

        if (!invitation) {
            return res.status(400).json({ message: 'Invalid or expired invitation token' });
        }

        // Create the user account
        const user = await User.create({
            name,
            email: invitation.email,
            password,
            role: invitation.role,
            grantedBy: invitation.invitedBy
        });

        invitation.status = 'accepted';
        invitation.targetUserId = user._id;
        await invitation.save();

        // Notify user to finalize project joining
        await Notification.create({
            recipientId: user._id,
            type: 'system_alert',
            message: `Account activated. Please finalize project joining in the Teams portal.`,
            metadata: { inviteId: invitation._id, type: 'PROJECT_INVITE' }
        });

        generateToken(res, user._id, user.role);

        res.status(201).json({
            success: true,
            data: { id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (error) {
        console.error('[ACCEPT_INVITE_ERROR]', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Verify token for frontend link view
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

        if (!invitation) return res.status(404).json({ message: 'Invalid or expired invitation' });

        res.status(200).json({
            success: true,
            data: { email: invitation.email, role: invitation.role, name: invitation.name }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
